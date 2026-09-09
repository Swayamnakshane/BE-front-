import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Scanner from './components/Scanner';
import DiagnosticCockpit from './components/DiagnosticCockpit';
import Chatbot from './components/Chatbot';
import { analyzeXRay } from './services/geminiService';
import { AppState, ScanResult } from './types';
import { ShieldCheck, Server, Wifi, Activity, UserCircle, Lock, LogIn } from 'lucide-react';
// ✅ Import PDF data generator for email
import { getPDFData } from './src/utils/pdfGenerator'; 

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // States for Login & Verification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [viewMode, setViewMode] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [isReportVerified, setIsReportVerified] = useState(false);

  // ✅ AUTO-EMAIL & WHATSAPP LOGIC
  const notifyDoctor = async (result: ScanResult, image: string) => {
    try {
      // 1. Generate PDF Data in background
      const pdfBase64 = getPDFData(result, image);

      // 2. Send to Backend
      await fetch('http://localhost:3001/api/notify-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: result.diagnosis,
          confidence: result.confidence,
          patientId: result.patientId,
          findings: result.reportText,
          pdfData: pdfBase64 // Sending the file
        })
      });
      console.log("🔔 Alerts sent (Email with PDF & WhatsApp)");
    } catch (e) {
      console.error("Notification Failed", e);
    }
  };

  const handleScan = async (image: string) => {
    setCurrentImage(image);
    setAppState(AppState.SCANNING);

    try {
      const result = await analyzeXRay(image);
      setScanResult(result);
      setAppState(AppState.REPORT);
      
      // ✅ Trigger Alert passing both Result AND Image
      notifyDoctor(result, image);
      
    } catch (error) {
      console.error("Analysis failed:", error);
      setAppState(AppState.IDLE);
      alert(`Diagnostic failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setCurrentImage(null);
    setScanResult(null);
    setIsChatOpen(false);
    setIsReportVerified(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ Hardcoded Credentials
    if (loginId === 'patient123' && loginPass === 'pulmo2026') {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Credentials (Try: patient123 / pulmo2026)");
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
         <div className="p-8 rounded-3xl glass-card w-full max-w-md space-y-8 border border-white/10">
            <div className="text-center space-y-2">
              <ShieldCheck size={48} className="mx-auto text-sky-500 mb-4" />
              <h1 className="text-2xl font-bold tracking-tight">PulmoSight Secure Access</h1>
              <p className="text-slate-400 text-sm">Authorized personnel only. HIPAA Compliant.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">User ID</label>
                <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-sky-500/50 transition-colors" placeholder="Enter ID" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-sky-500/50 transition-colors" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all uppercase tracking-tight">
                ACCESS WORKSTATION
              </button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-200 flex flex-col pb-10">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card !rounded-none border-t-0 border-x-0 bg-slate-900/80 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-[10px] tracking-widest uppercase">
            <ShieldCheck size={12} /> HIPAA COMPLIANT
          </div>
        </div>
        <div className="flex items-center gap-4">
           {/* Mode Switcher */}
           <button onClick={() => setViewMode(viewMode === 'PATIENT' ? 'DOCTOR' : 'PATIENT')} className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase hover:bg-white/10 transition-all">
             Switch to {viewMode === 'PATIENT' ? 'Doctor' : 'Patient'} View
           </button>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-16 pb-20">
        <AnimatePresence mode="wait">
          {appState === AppState.IDLE || appState === AppState.SCANNING ? (
            <motion.div key="scanner-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Scanner onScanComplete={handleScan} isProcessing={appState === AppState.SCANNING} />
            </motion.div>
          ) : (
            <motion.div key="report-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DiagnosticCockpit
                result={scanResult!}
                image={currentImage!}
                onOpenChat={() => setIsChatOpen(true)}
                onReset={resetApp}
                isVerified={isReportVerified}
                onVerify={() => setIsReportVerified(true)}
                viewMode={viewMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {scanResult && <Chatbot reportContext={scanResult.reportText} isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
      
      {/* 👇 NEW: FIXED CLINICAL DISCLAIMER */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-sm text-slate-400 text-[10px] py-2.5 text-center z-50 border-t border-slate-800 shadow-lg tracking-widest uppercase font-bold">
        <span className="mr-2 inline-block">⚠️</span>
        PulmoSight AI is a clinical decision support tool and does not replace professional medical judgment.
      </div>
    </div>
  );
};

export default App;