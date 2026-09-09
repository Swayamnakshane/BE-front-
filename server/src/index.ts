import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeXRay, chatWithAI } from './services/gemini';
import twilio from 'twilio';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- 1. CONFIGURATION (Your Credentials) ---
import "dotenv/config";

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;

const WHATSAPP_FROM = process.env.WHATSAPP_FROM;
const TARGET_PHONE = process.env.TARGET_PHONE;

if (!TWILIO_SID || !TWILIO_TOKEN || !WHATSAPP_FROM || !TARGET_PHONE) {
  throw new Error("Missing Twilio environment variables");
}



// const TWILIO_SID = process.env.TWILIO_SID;;
// const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
// const WHATSAPP_FROM = "whatsapp:+14155238886";
// const TARGET_PHONE = "whatsapp:+917875138495"; 

const EMAIL_USER = "kunalz2308@gmail.com";
const EMAIL_PASS = "ucbr bekh dsgg pakc";
const DOCTOR_EMAIL = "himanshutapde.skn.comp@gmail.com";

// Initialize Clients
const client = twilio(TWILIO_SID, TWILIO_TOKEN);
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

app.use(cors());
// Increased limit to accept PDF files from frontend
app.use(express.json({ limit: '50mb' })); 

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => { res.send('PulmoSight API is running'); });

app.post('/api/analyze', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: 'Image data is required' });
        const result = await analyzeXRay(image);
        res.json(result);
    } catch (error) {
        console.error('Error in analyze endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        if (!message || !context) return res.status(400).json({ error: 'Message required' });
        const response = await chatWithAI(message, context);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- 2. NOTIFICATION ENDPOINT (Email PDF + WhatsApp Alert) ---
app.post('/api/notify-doctor', async (req, res) => {
    const { diagnosis, confidence, patientId, findings, pdfData } = req.body;
    
    // Determine severity
    const isCritical = diagnosis !== 'Normal' || confidence > 85;
    const severity = isCritical ? "HIGH" : "LOW";
    const logs = [];

    // A. SEND EMAIL (With PDF Attachment)
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: DOCTOR_EMAIL,
            subject: `[${severity}] PulmoSight Report: ${patientId}`,
            text: `
PULMOSIGHT MEDICAL ALERT
------------------------
Patient ID: ${patientId}
Diagnosis: ${diagnosis}
Confidence: ${confidence}%

The full diagnostic report is attached to this email.
            `,
            attachments: [
                {
                    filename: `Report_${patientId}.pdf`,
                    content: pdfData,           
                    encoding: 'base64'          
                }
            ]
        };
        await transporter.sendMail(mailOptions);
        logs.push("Email with PDF Sent");
        console.log("✅ PDF Emailed successfully");
    } catch (error) {
        console.error("Email Error:", error);
        logs.push("Email Failed");
    }

    // B. SEND WHATSAPP (Text Alert)
    try {
        const msgBody = `🚨 *PULMOSIGHT ALERT*\nPatient: ${patientId}\nDiagnosis: ${diagnosis} (${confidence}%)\n\n📄 *Full PDF Report has been sent to your email.*`;
        
        await client.messages.create({
            from: WHATSAPP_FROM,
            to: TARGET_PHONE,
            body: msgBody
        });
        logs.push("WhatsApp Alert Sent");
        console.log("✅ WhatsApp Alert sent");
    } catch (error) {
        console.error("Twilio Error:", error);
        logs.push("WhatsApp Failed");
    }

    res.json({ success: true, logs });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});