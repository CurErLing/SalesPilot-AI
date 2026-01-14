
import React, { useState, useRef, useEffect } from 'react';
import { Customer, ChatMessage } from '../../types';
import { sendChatMessage } from '../../services/geminiService';
import { Send, Sparkles, Mic, FileText, FileBarChart, ClipboardList } from 'lucide-react';
import { ChatBubble } from '../ui/ChatBubble';

interface Props {
  customer: Customer;
}

export const ChatMode: React.FC<Props> = ({ customer }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Welcome Message
  useEffect(() => {
    setChatMessages([
        { id: 'init', role: 'model', text: `你好！我是 **${customer.name}** 的专属助理。你可以随时问我关于客户的问题，或点击下方 ✨ 按钮快速生成文档。`, timestamp: Date.now() }
    ]);
  }, [customer.id]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的浏览器暂不支持语音输入功能，请使用 Chrome 或 Edge。");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev + transcript);
    };
    recognition.start();
  };

  const handleChatSend = async (overrideText?: string) => {
    const text = overrideText || chatInput;
    if (!text.trim() || isStreaming) return;
    
    setChatInput('');
    setShowQuickActions(false);
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    const history = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));

    try {
      const streamResult = await sendChatMessage(history, text, customer);
      const botMsgId = (Date.now() + 1).toString();
      setChatMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);

      let fullText = "";
      for await (const chunk of streamResult) {
        fullText += chunk.text;
        setChatMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleQuickAction = (actionType: string) => {
      let prompt = "";
      switch(actionType) {
          case 'REQ_DOC':
              prompt = "请基于当前客户画像和所有的沟通记录，整理一份结构化的《业务需求说明书(BRD)》草稿。";
              break;
          case 'REVIEW':
              prompt = "请生成一份《客户阶段性回顾报告》，总结目前的跟进情况、已识别的关键决策人态度及下一步建议。";
              break;
          case 'VISIT_LOG':
              prompt = "请基于最近的拜访记录，生成一份《会议纪要》摘要，包含核心议题、达成的共识和待办事项。";
              break;
      }
      if (prompt) handleChatSend(prompt);
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatMessages.map(msg => (
                <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
            ))}
            {isStreaming && <ChatBubble role="model" isTyping />}
            <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && (
            <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-3 gap-2 animate-in slide-in-from-bottom-2">
                <button onClick={() => handleQuickAction('REQ_DOC')} className="flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 gap-1">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-medium">需求文档</span>
                </button>
                <button onClick={() => handleQuickAction('REVIEW')} className="flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 gap-1">
                    <FileBarChart className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-medium">客户回顾</span>
                </button>
                <button onClick={() => handleQuickAction('VISIT_LOG')} className="flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 gap-1">
                    <ClipboardList className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-medium">会议纪要</span>
                </button>
            </div>
        )}

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative flex gap-2 items-end">
                <button 
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className={`p-2.5 rounded-xl transition-colors ${showQuickActions ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    <Sparkles className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                    <input 
                        className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="输入问题或语音对话..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                    />
                    <button 
                        onClick={toggleVoiceInput}
                        className={`absolute right-1 top-1 p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
                    >
                        <Mic className="w-4 h-4" />
                    </button>
                </div>
                <button 
                    onClick={() => handleChatSend()}
                    disabled={!chatInput.trim() || isStreaming}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
  );
};
