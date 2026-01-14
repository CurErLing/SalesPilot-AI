import React, { useState, useRef, useEffect } from 'react';
import { Customer, ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Props {
  customer: Customer;
}

const ChatAssistant: React.FC<Props> = ({ customer }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `你好！我是 **${customer.name}** 的专属销售助理。你可以问我关于这个客户的任何问题，或者让我起草跟进邮件。`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const streamResult = await sendChatMessage(history, userMsg.text, customer);
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);

      let fullText = "";
      for await (const chunk of streamResult) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setMessages(prev => 
            prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m)
        );
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "抱歉，出错了。请重试。", timestamp: Date.now() }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Bot className="w-5 h-5" />
        </div>
        <div>
            <h3 className="font-semibold text-slate-800">项目问答机器人</h3>
            <p className="text-xs text-slate-500">当前环境: {customer.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                        {msg.text}
                    </div>
                </div>
            </div>
        ))}
        {isStreaming && (
            <div className="flex justify-start">
                 <div className="bg-slate-100 text-slate-500 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> 思考中...
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex gap-2 relative">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="询问关于该客户的问题，生成邮件，或总结信息..."
                className="flex-1 border border-slate-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm h-12 max-h-32"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
        <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">AI 可能犯错。请核实重要信息。</p>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;