import { ScanResult } from "../types";

const API_BASE_URL = 'http://localhost:5000';

export const analyzeXRay = async (base64Image: string): Promise<ScanResult> => {
  try {
    // Convert base64 to a File object that Flask can receive
    const byteString = atob(base64Image.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });
    const file = new File([blob], 'xray_scan.png', { type: 'image/png' });

    // Send as FormData (matches Flask's request.files['image'])
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Map Flask response to frontend ScanResult format
    return {
      patientId: "ANON-" + Math.floor(Math.random() * 1000000000),
      diagnosis: data.disease,
      confidence: data.confidence,
      findings: [data.disease],
      reportText: data.report || "Report unavailable.",
      reportTextHindi: data.report_hindi || "",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing X-ray:', error);
    throw error;
  }
};

export const chatWithAI = async (message: string, context: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question: message, 
        report_context: context 
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error('Error chatting with AI:', error);
    throw error;
  }
};