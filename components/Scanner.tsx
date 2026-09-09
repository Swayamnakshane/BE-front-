import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Stethoscope, Microscope, BrainCircuit } from 'lucide-react';

// 👇 NEW: The Dynamic Timeline Component
const ProcessingTimeline = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Extracting Radiological Features...",
    "Running Deep Learning Classification...",
    "Synthesizing Medical Report..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500); // Ticks every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-full max-w-sm p-6 rounded-2xl glass-card border-white/20 bg-slate-900/90 shadow-2xl backdrop-blur-md">
      <h4 className="font-bold text-sky-400 mb-4 animate-pulse flex items-center gap-2 text-sm uppercase tracking-widest">
        <BrainCircuit size={16} /> Analysis Sequence Initiated
      </h4>
      <div className="space-y-4">
        {steps.map((text, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div 
              key={index} 
              className={`flex items-center text-xs tracking-wide transition-all duration-500 font-medium ${
                isDone ? 'text-emerald-400' : 
                isActive ? 'text-white translate-x-2' : 'text-slate-500'
              }`}
            >
              <span className="mr-3 text-base">
                {isDone ? '✅' : isActive ? '⏳' : '⚪'}
              </span>
              <span>{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ScannerProps {
  onScanComplete: (file: string) => void;
  isProcessing: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onScanComplete(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full mb-6">
          <Stethoscope size={14} className="text-sky-400" />
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Medical Diagnostic Interface</span>
        </div>
        <h1 className="text-5xl font-light tracking-tight mb-4 text-white">
          <span className="font-bold text-sky-500">Pulmo</span>Sight <span className="text-slate-500">Clinical AI</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto font-medium text-sm leading-relaxed">
          Advanced radiographic analysis for automated pulmonary screening. 
          Upload clinical assets to initiate feature mapping and diagnostic synthesis.
        </p>
      </motion.div>

      <div
        className={`relative group rounded-[2.5rem] border transition-all duration-500 min-h-[400px] flex items-center justify-center overflow-hidden glass-card
          ${dragActive ? 'border-sky-400 bg-sky-500/5 ring-4 ring-sky-500/10' : 'border-white/10'}
          ${preview ? 'border-sky-500/30' : 'hover:border-sky-500/40'}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-6 cursor-pointer py-16"
            >
              <div className="w-20 h-20 rounded-3xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-inner">
                <Upload className="w-8 h-8 text-sky-400" />
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-white tracking-tight">Select Radiological Asset</p>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">DICOM / PNG / JPEG / TIFF</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full h-full flex items-center justify-center p-8 bg-slate-900/50"
            >
              <img src={preview} alt="Radiograph" className="max-w-full max-h-[500px] rounded-2xl shadow-2xl border border-white/5" />
              
              {isProcessing && (
                <>
                  {/* 👇 NEW: Trigger the Timeline Component */}
                  <ProcessingTimeline />
                  
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                      initial={{ top: "-10%" }}
                      animate={{ top: "110%" }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                      className="absolute left-0 w-full h-[150px] bg-gradient-to-b from-transparent via-sky-400/20 to-transparent z-10"
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Scanner;