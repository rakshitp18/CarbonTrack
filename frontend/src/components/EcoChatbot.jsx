import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GiSprout } from 'react-icons/gi';
import { FiSend, FiX, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { sendGroqChatMessage } from '../services/groqService';
import { useTheme } from '../context/ThemeContext';

const SUGGESTIONS = [
  '🚴 How can I lower commute emissions?',
  '⚡ Tips to reduce home energy use',
  '🥗 What foods have the lowest footprint?',
  '📊 How do I calculate my CO₂ output?'
];

export default function EcoChatbot() {
  const location = useLocation();
  const themeContext = useTheme();
  const isDark = themeContext ? themeContext.theme === 'dark' : true;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm **EcoBot** 🌿, your AI sustainability assistant. How can I help you track or reduce your carbon footprint today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Hide Chatbot on Landing Page ('/')
    if (location.pathname === '/') {
      return null;
    }

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: query.trim() }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const apiHistory = newMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const reply = await sendGroqChatMessage(apiHistory);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: '⚠️ *Sorry, I encountered an issue connecting to Groq AI. Please check your API key or network connection.*'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat history cleared. How else can **EcoBot** 🌿 assist your green journey?"
      }
    ]);
  };

  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong
                  key={pIdx}
                  className={`font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}
                >
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 focus:outline-none transition-all duration-300 cursor-pointer"
          aria-label="Open EcoBot Chatbot"
        >
          {/* Animated Glow Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-40 blur-md group-hover:opacity-75 transition duration-500 animate-pulse" />
          
          <div className="relative flex items-center justify-center text-2xl text-white">
            {isOpen ? <FiX className="text-2xl" /> : <GiSprout className="text-3xl animate-bounce-short" />}
          </div>
        </motion.button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed bottom-24 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[82vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden font-sans border transition-colors duration-300 ${
              isDark
                ? 'bg-slate-900/95 backdrop-blur-xl border-emerald-500/30 text-slate-100 shadow-emerald-950/50'
                : 'bg-white/95 backdrop-blur-xl border-emerald-500/20 text-slate-800 shadow-slate-400/40'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-5 py-4 border-b transition-colors duration-300 ${
                isDark
                  ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-emerald-500/20'
                  : 'bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 border-emerald-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-500">
                  <GiSprout className="text-2xl" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-ping" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className={`font-bold text-base leading-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                      EcoBot AI
                    </h3>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                      Groq Llama 3.3
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CarbonTrack Smart Assistant</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleClear}
                  title="Clear Chat"
                  className={`p-2 rounded-lg transition cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FiTrash2 className="text-base" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className={`p-2 rounded-lg transition cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FiX className="text-lg" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mr-2 mt-1">
                      <GiSprout className="text-sm" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-xs shadow-md shadow-emerald-900/30'
                        : isDark
                        ? 'bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-2xl rounded-tl-xs shadow-md'
                        : 'bg-emerald-50/90 border border-emerald-200/70 text-slate-800 rounded-2xl rounded-tl-xs shadow-sm'
                    }`}
                  >
                    {renderFormattedText(msg.content)}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start items-center space-x-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <GiSprout className="text-sm animate-spin" />
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl rounded-tl-xs text-xs flex items-center space-x-2 ${
                      isDark
                        ? 'bg-slate-800/90 border border-slate-700/70 text-slate-400'
                        : 'bg-emerald-50/90 border border-emerald-200/70 text-slate-600'
                    }`}
                  >
                    <FiRefreshCw className="animate-spin text-emerald-500" />
                    <span>EcoBot is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips (shown if only welcome msg) */}
            {messages.length <= 2 && !loading && (
              <div className="px-4 pb-2">
                <p className={`text-[11px] mb-1.5 font-medium flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <HiSparkles className="text-emerald-500" /> Suggested topics:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sug)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all text-left cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 hover:bg-emerald-950/60 border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300'
                          : 'bg-slate-100 hover:bg-emerald-50 border-slate-200 hover:border-emerald-400 text-slate-700 hover:text-emerald-700'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className={`p-3 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask EcoBot anything..."
                  disabled={loading}
                  className={`flex-1 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition border ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700/80 focus:border-emerald-500 text-slate-100 placeholder-slate-500'
                      : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-900/30 transition cursor-pointer"
                >
                  <FiSend className="text-base" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
