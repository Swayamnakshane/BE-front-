import React, { useState, useMemo } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { 
  Download, MessageSquare, Stethoscope, User, Image as ImageIcon,
  ZoomIn, ZoomOut, Maximize2, FileText, Clock, Search, ClipboardCheck,
  Calendar, Filter, ShieldCheck, ArrowRight
} from 'lucide-react';
import CircularProgress from './CircularProgress';
import Typewriter from './Typewriter';
import { ScanResult } from '../types';
import { generateClinicalPDF } from "../src/utils/pdfGenerator";

interface DiagnosticCockpitProps {
  result: ScanResult;
  image: string;
  onOpenChat: () => void;
  onReset: () => void;
  isVerified: boolean;
  onVerify: () => void;
  viewMode: 'PATIENT' | 'DOCTOR';
}

const DiagnosticCockpit: React.FC<DiagnosticCockpitProps> = ({ result, image, onOpenChat, onReset, isVerified, onVerify, viewMode }) => {
  const isCritical = result.diagnosis !== 'Normal';
  const primaryColor = isCritical ? '#f43f5e' : '#0ea5e9';
  
  const [scale, setScale] = useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <div className="max-w-7xl mx-auto px-8 py-6 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-8">
        <div className="flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20">
            <Stethoscope className="text-sky-400" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Radiological Workstation</h2>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Clinical Data Sync: Optimized</span>
               <span>|</span>
               <span className={`px-2 py-0.5 rounded text-white ${viewMode === 'DOCTOR' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                 {viewMode} VIEW
               </span>
            </div>
          </div>
        </div>
        <button onClick={onReset} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
          New Case Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Asset Viewer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-card space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <User size={14} /> Case Identifier
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Patient ID</p>
                <p className="text-white font-semibold text-lg">{result.patientId}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Date</p>
                <p className="text-white font-semibold text-lg">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Verification Status Banner */}
            {isVerified ? (
              <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 text-emerald-400 font-bold tracking-widest uppercase text-xs">
                <ShieldCheck size={16} /> Verified by Doctor
              </div>
            ) : (
              <div className="w-full py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-center gap-2 text-yellow-400 font-bold tracking-widest uppercase text-xs">
                <Clock size={16} /> Pending Verification
              </div>
            )}
          </div>

          <div className="space-y-4">
            <motion.div 
              className="relative rounded-[2rem] overflow-hidden border bg-slate-900/80 h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing group shadow-2xl"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                 <button onClick={() => setScale(1)} className="p-3 bg-slate-900/90 rounded-2xl text-slate-400"><Maximize2 size={18} /></button>
              </div>
              <motion.img 
                src={image} 
                drag={scale > 1}
                dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                style={{ scale, x, y }}
                className="w-full h-full object-contain brightness-95 contrast-[1.05]" 
              />
            </motion.div>
          </div>
        </div>

        {/* Right: Diagnostic Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl glass-card flex flex-col items-center justify-center">
              <CircularProgress percentage={result.confidence} color={primaryColor} size={180} />
            </div>
            <div className="p-8 rounded-3xl glass-card">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                <ClipboardCheck size={14} /> Diagnostic Findings
              </h3>
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-10 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-sky-500'}`} />
                <div>
                  <span className="text-3xl font-bold text-white tracking-tight uppercase">{result.diagnosis}</span>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Primary Indication</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-3xl glass-card min-h-[300px]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-6">
              <FileText size={14} /> Formal Medical Report
            </h3>

            <div className="text-slate-300 text-sm leading-relaxed font-medium bg-slate-950/40 p-6 rounded-2xl border border-white/5">
              <Typewriter text={result.reportText} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => generateClinicalPDF(result, image)} 
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-sky-600 text-white font-bold hover:bg-sky-500 transition-all shadow-lg uppercase tracking-tight"
            >
              <Download size={20} /> Export Clinical PDF
            </button>
            
            {viewMode === 'DOCTOR' && !isVerified && (
               <button 
                onClick={onVerify} 
                className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all shadow-lg uppercase tracking-tight"
               >
                 <ShieldCheck size={20} /> Verify & Sign Report
               </button>
            )}

            <button onClick={onOpenChat} className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all uppercase tracking-tight">
              <MessageSquare size={20} /> Professional Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DiagnosticCockpit;