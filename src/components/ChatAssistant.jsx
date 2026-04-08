import React, { useState, useEffect, useRef } from 'react';
import { useFloatingActionStack } from '../context/FloatingActionContext';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Loader2, Sparkles, Send, X } from 'lucide-react';
import api from '../services/api';

/**
 * Global AI Chat Assistant (Thabat Coach).
 * Uses React Portals for top-layer management to avoid stacking context issues.
 * Features mobile-responsive HUD and real-time history sanitization on the backend.
 */
const ChatAssistant = () => {
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: [{ text: "السلام عليكم يا حامل القرآن، أنا مساعدك الذكي في ثبات. كيف أساعدك في وردك اليوم؟" }]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef(null);

  // --- EFFECTS ---
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // --- HANDLERS ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: input,
        history: messages.map(m => ({ 
           role: m.role, 
           parts: m.parts 
        }))
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: res.data.reply }] }]);
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: "عذراً، واجهت مشكلة في الاتصال. يرجى المحاولة لاحقاً." }] 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const { registerElement, unregisterElement } = useFloatingActionStack();

  useEffect(() => {
    registerElement('bottomLeft', 'chat-assistant', content);
    return () => unregisterElement('bottomLeft', 'chat-assistant');
  }, [registerElement, unregisterElement, content]);

  // --- RENDER ---
  const content = (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto h-14 w-14 bg-emerald-500 text-zinc-950 rounded-full shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center border-2 border-white/20 active:scale-90 transition-transform"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-4 right-4 md:left-8 md:right-auto md:w-[400px] h-[550px] md:h-[650px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[75vh] pointer-events-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-emerald-500/5 flex items-center justify-between" dir="rtl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Bot className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">مساعد ثبات</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase">متصل الآن</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide" dir="rtl">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      m.role === 'user' ? 'bg-slate-800 border-white/5' : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      {m.role === 'user' ? <User className="h-4 w-4 text-slate-400" /> : <Bot className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none text-right' 
                        : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none font-medium text-right'
                    }`}>
                      {m.parts[0].text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                   <div className="max-w-[85%] flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-spin">
                         <Loader2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                         جاري التفكير...
                      </div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10 bg-white/[0.02]" dir="rtl">
              <div className="relative flex items-center px-4 bg-slate-800/50 border border-white/10 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="...اسأل مدربك الذكي"
                  className="flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-slate-500 outline-none font-bold"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="p-2 text-emerald-500 hover:text-emerald-400 disabled:opacity-30 transition-all"
                >
                  <Send className="h-5 w-5 -scale-x-100" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (!mounted) return null;

  return null; // Rendered via FloatingActionStack
};

export default ChatAssistant;
