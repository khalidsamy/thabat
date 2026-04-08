import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import api from '../services/api';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: [{ text: "السلام عليكم يا حامل القرآن، أنا مساعدك الذكي في ثبات. كيف أساعدك في وردك اليوم؟" }]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portalNode, setPortalNode] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setPortalNode(document.getElementById('chat-portal-root'));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

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

  const content = (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-[999] bottom-[calc(env(safe-area-inset-bottom)+9.5rem)] right-4 h-12 w-12 sm:bottom-28 sm:right-8 sm:h-14 sm:w-14 bg-emerald-500 text-zinc-950 rounded-full shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center border-2 border-white/20"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed z-[1000] bottom-[calc(env(safe-area-inset-bottom)+14rem)] right-4 left-4 sm:left-auto sm:right-8 sm:w-[400px] h-[500px] sm:h-[600px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Bot className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Thabat Coach</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Online Assistant</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      m.role === 'user' ? 'bg-slate-800 border-white/5' : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      {m.role === 'user' ? <User className="h-4 w-4 text-slate-400" /> : <Bot className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none font-medium'
                    }`}>
                      {m.parts[0].text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="max-w-[85%] flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-spin">
                         <Loader2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                         Thabat Coach is thinking...
                      </div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10 bg-white/[0.02]">
              <div className="relative flex items-center px-4 bg-slate-800/50 border border-white/10 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your Hifz Coach..."
                  className="flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-slate-500 outline-none font-bold"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="p-2 text-emerald-500 hover:text-emerald-400 disabled:opacity-30 transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const targetNode = document.getElementById('chat-portal-root') || document.body;
  return createPortal(content, targetNode);
};

export default ChatAssistant;
