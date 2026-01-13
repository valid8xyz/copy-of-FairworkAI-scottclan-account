
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';
import { askAssistant, isApiConfigured } from '../services/geminiService';
import { Award } from '../types';

interface AssistantProps {
    availableAwards: Award[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const Assistant: React.FC<AssistantProps> = ({ availableAwards }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I am your FairPay assistant. I have access to your Document Library. Ask me about rates, penalties, or rules for any ingested award.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isApiConfigured()) {
        setMessages(prev => [...prev, { role: 'user', content: input }, { role: 'ai', content: 'API Key missing. Cannot connect to Gemini.' }]);
        setInput('');
        return;
    }

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Pass the availableAwards as the knowledge base
      const response = await askAssistant(userMsg, availableAwards);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center space-x-2 bg-slate-50 rounded-t-xl">
        <Bot className="w-5 h-5 text-violet-600" />
        <h2 className="font-semibold text-slate-800">Award Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex space-x-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-violet-100'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-violet-600" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-100 p-3 rounded-2xl text-sm text-slate-500 italic">
                Thinking...
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-200">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
            placeholder="Ask about rates, allowances, or penalties..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-lg transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Assistant;
