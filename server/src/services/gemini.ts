import axios from 'axios';
import FormData from 'form-data';
import { ScanResult } from '../types';

// ✅ FIXED: Connects to Port 5000 (Python) using 127.0.0.1 (IPv4)
const PYTHON_API_URL = 'http://127.0.0.1:5000';

export const analyzeXRay = async (base64Image: string): Promise<ScanResult> => {
  try {
    console.log("🔄 Translator: Converting JSON to File for Python...");

    // 1. Remove the header (e.g., "data:image/png;base64,")
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    // 2. Turn it into a Buffer (Raw file data)
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // 3. Pack it into FormData (This is what Python expects!)
    const form = new FormData();
    form.append('image', imageBuffer, { filename: 'upload.png' });
    form.append('age', "Unknown");
    form.append('symptoms', "None");

    // 4. Send to Python Port 5000
    const response = await axios.post(`${PYTHON_API_URL}/analyze`, form, {
      headers: { ...form.getHeaders() }
    });

    console.log("✅ Diagnosis received from Python!");

    return {
      diagnosis: response.data.disease,
      confidence: response.data.confidence,
      reportText: response.data.report,
      // 🔥 THIS IS THE NEW LINE FOR HINDI SUPPORT:
      reportTextHindi: response.data.report_hindi, 
      findings: response.data.findings || [],
      patientId: "ANON-" + Date.now(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("❌ Python Bridge Failed:", error);
    throw new Error("AI Engine (Port 5000) is unreachable.");
  }
};

export const chatWithAI = async (message: string, context: string) => {
  try {
    const response = await axios.post(`${PYTHON_API_URL}/chat`, {
      question: message,
      report_context: context
    });
    return response.data.answer;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I am unable to connect to the medical database right now.";
  }
};