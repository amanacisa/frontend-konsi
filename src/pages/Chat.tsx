import  { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader, RotateCcw, TrendingUp, BookOpen } from 'lucide-react';
import { chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  "Apa itu UUD 1945?",
  "Jelaskan tentang HAM dalam UUD",
  "Bagaimana sistem presidensial Indonesia?",
  "Apa itu Pasal 33 UUD 1945?",
  "Mengapa UUD 1945 diamandemen?"
];

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Halo! Saya LexGuru, asisten AI untuk belajar konstitusi Indonesia. Saya siap membantu Anda memahami UUD 1945 dengan bahasa yang mudah dipahami. Apa yang ingin Anda ketahui?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    user?.learningLevel || 'beginner'
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Create session when component mounts
    const initSession = async () => {
      try {
        const response = await chatAPI.createSession(userLevel);
        setSessionId(response.sessionId);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };

    initSession();
  }, [userLevel]);
  const handleSend = async (messageText?: string) => {
    const messageToSend = messageText || input.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(messageToSend, sessionId || undefined, userLevel);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update session ID if it was created
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }
    } catch (error) {
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = async (newLevel: 'beginner' | 'intermediate' | 'advanced') => {
    setUserLevel(newLevel);
    
    if (sessionId) {
      try {
        await chatAPI.updateLevel(sessionId, newLevel);
        toast.success(`Level pembelajaran diubah ke ${newLevel === 'beginner' ? 'Pemula' : newLevel === 'intermediate' ? 'Menengah' : 'Lanjut'}`);
      } catch (error) {
        console.error('Failed to update level:', error);
      }
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat telah direset. Mari mulai pembelajaran konstitusi dari awal! Apa yang ingin Anda ketahui?',
        timestamp: new Date()
      }
    ]);
    toast.success('Chat telah direset');
  };

  return (
  <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-6 sm:mb-8"
    >
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
        <span>LexTalk - AI Guru Konstitusi</span>
      </h1>
      <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto px-2">
        Belajar UUD 1945 dengan chatbot AI yang dapat menjelaskan pasal-pasal konstitusi dalam bahasa yang mudah dipahami
      </p>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="lg:col-span-1 order-2 lg:order-1"
      >
        {/* Level Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="font-semibold text-primary-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Level Pembelajaran
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level as any)}
                className={`w-full text-left p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                  userLevel === level
                    ? 'bg-primary-100 text-primary-900 border-2 border-primary-200'
                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="font-medium capitalize text-sm sm:text-base">
                  {level === 'beginner' && '🌱 Pemula'}
                  {level === 'intermediate' && '📈 Menengah'}
                  {level === 'advanced' && '🎯 Lanjut'}
                </div>
                <div className="text-xs sm:text-sm opacity-75 mt-1">
                  {level === 'beginner' && 'Penjelasan dasar dan sederhana'}
                  {level === 'intermediate' && 'Analisis dengan contoh kasus'}
                  {level === 'advanced' && 'Diskusi mendalam dan kritis'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="font-semibold text-primary-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            Pertanyaan Populer
          </h3>
          <div className="space-y-2">
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSend(prompt)}
                className="w-full text-left p-2 sm:p-3 text-xs sm:text-sm bg-neutral-50 hover:bg-primary-50 rounded-lg transition-colors duration-300 text-neutral-700 hover:text-primary-700"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="lg:col-span-3 order-1 lg:order-2"
      >
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 sm:p-6 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-sm sm:text-base">LexGuru Assistant</h2>
              <p className="text-primary-100 text-xs sm:text-sm">
                Level: {userLevel === 'beginner' ? 'Pemula' : userLevel === 'intermediate' ? 'Menengah' : 'Lanjut'}
              </p>
            </div>
            <button
              onClick={resetChat}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2 sm:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-accent-400 text-primary-900'
                  }`}>
                    {message.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  
                  <div className={`flex-1 max-w-[75%] sm:max-w-xs md:max-w-md ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 sm:p-4 rounded-2xl shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-sm'
                    }`}>
                      <p className="leading-relaxed text-sm sm:text-base">{message.content}</p>
                    </div>
                    <p className={`text-xs text-neutral-400 mt-1 sm:mt-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {message.timestamp.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-2 sm:gap-4"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-400 text-primary-900 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="bg-neutral-100 rounded-2xl rounded-bl-sm p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-primary-600" />
                    <span className="text-neutral-600 text-sm sm:text-base">LexGuru sedang berpikir...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-6 border-t border-neutral-200">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="Tanyakan tentang UUD 1945..."
                className="flex-1 p-3 sm:p-4 border border-neutral-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-4 py-3 sm:px-6 sm:py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                {loading ? (
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="hidden sm:inline">Kirim</span>
                <span className="sm:hidden">Send</span>
              </motion.button>
            </div>
            
            <p className="text-xs text-neutral-500 mt-2 sm:mt-3 text-center px-2">
              LexGuru dapat memberikan penjelasan umum tentang konstitusi, bukan nasihat hukum profesional.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);
}