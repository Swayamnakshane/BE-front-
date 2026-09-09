
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2, Info } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatbotProps {
  reportContext: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ reportContext, isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(input, reportContext);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Interface timeout. Please re-initiate the session." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="mb-4 w-[420px] h-[550px] rounded-[2rem] overflow-hidden glass-card border-white/20 shadow-2xl flex flex-col"
          >
            {/* Professional Header */}
            <div className="p-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400">
                  <Bot size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-tight">Clinical Assistant</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Medical Logic Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="px-5 py-2.5 bg-sky-500/5 border-b border-white/5 flex items-center gap-2.5">
              <Info size={14} className="text-sky-400 shrink-0" />
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter leading-tight">
                AI provided for decision support. Final diagnosis requires professional verification.
              </p>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-900/20">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center">
                    <MessageSquare size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Consultative Interface</p>
                    <p className="text-slate-500 text-xs mt-1">Please ask clinical questions regarding the current radiographic profile.</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-sky-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 shadow-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Professional Input */}
            <div className="p-5 bg-slate-900 border-t border-white/5">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter clinical query..."
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-sky-500/40 transition-all placeholder:text-slate-600"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2.5 top-2 p-2 rounded-xl bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-20 transition-all shadow-md"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-3xl bg-sky-600 flex items-center justify-center shadow-xl hover:shadow-sky-500/30 z-50 transition-all border border-sky-400/20"
      >
        <MessageSquare className="text-white" size={26} />
      </motion.button>
    </div>
  );
};

export default Chatbot;
