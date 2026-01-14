
import React, { useState, useRef, useEffect } from 'react';
import { Customer, ChatMessage, Stakeholder } from '../../types';
import { startRolePlaySession } from '../../services/geminiService';
import { Send, Swords, Mic } from 'lucide-react';
import { ChatBubble } from '../ui/ChatBubble';

interface Props {
  customer: Customer;
}

export const RolePlayMode: React.FC<Props> = ({ customer }) => {
  const [rolePlayMessages, setRolePlayMessages] = useState<ChatMessage[]>([]);
  const [rolePlayInput, setRolePlayInput] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [isRolePlayActive, setIsRolePlayActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset when customer changes
    resetRolePlay();
  }, [customer.id]);

  useEffect(() => {
    scrollToBottom();
  }, [rolePlayMessages, isRolePlayActive]);

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
      setRolePlayInput(prev => prev + transcript);
    };
    recognition.start();
  };

  const startRolePlay = (dm: Stakeholder) => {
      setSelectedStakeholder(dm);
      setIsRolePlayActive(true);
      setRolePlayMessages([
        { id: 'rp-init', role: 'model', text: `(已进入角色: ${dm.name} - ${dm.title})\n\n你好，我是${dm.name}。找我有什么事？简单直接点。`, timestamp: Date.now() }
      ]);
  };

  const handleRolePlaySend = async () => {
    if (!rolePlayInput.trim() || isStreaming || !selectedStakeholder) return;
    const text = rolePlayInput;
    setRolePlayInput('');

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setRolePlayMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    const history = rolePlayMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));

    try {
        const streamResult = await startRolePlaySession(history, text, customer, selectedStakeholder);
        const botMsgId = (Date.now() + 1).toString();
        setRolePlayMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);
  
        let fullText = "";
        for await (const chunk of streamResult) {
          fullText += chunk.text;
          setRolePlayMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsStreaming(false);
    }
  };

  const resetRolePlay = () => {
      setIsRolePlayActive(false);
      setSelectedStakeholder(null);
      setRolePlayMessages([]);
  };

  return (
    <div className="h-full flex flex-col">
        {!isRolePlayActive ? (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600">
                        <Swords className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">选择陪练对象</h3>
                </div>
                <div className="space-y-2">
                    {customer.persona.decisionMakers && customer.persona.decisionMakers.length > 0 ? (
                        customer.persona.decisionMakers.map(dm => (
                            <button key={dm.id} onClick={() => startRolePlay(dm)} className="w-full text-left p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {dm.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-700">{dm.name}</div>
                                        <div className="text-[10px] text-slate-400">{dm.role}</div>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            暂无决策人数据，请先完善画像。
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <>
                <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            {selectedStakeholder?.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-indigo-900">{selectedStakeholder?.name}</span>
                    </div>
                    <button onClick={resetRolePlay} className="text-[10px] text-indigo-500 hover:underline">重置</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {rolePlayMessages.map(msg => (
                        <ChatBubble 
                            key={msg.id} 
                            role={msg.role} 
                            text={msg.text} 
                            avatarLabel={msg.role === 'model' ? selectedStakeholder?.name.charAt(0) : undefined}
                        />
                    ))}
                    {isStreaming && (
                        <ChatBubble role="model" isTyping avatarLabel={selectedStakeholder?.name.charAt(0)} />
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-3 bg-white border-t border-slate-200">
                    <div className="relative flex gap-2">
                        <div className="flex-1 relative">
                            <input 
                                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                                placeholder="输入演练话术..."
                                value={rolePlayInput}
                                onChange={(e) => setRolePlayInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRolePlaySend()}
                            />
                            <button onClick={toggleVoiceInput} className={`absolute right-1 top-1 p-1.5 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'text-slate-400'}`}>
                                <Mic className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={handleRolePlaySend} disabled={!rolePlayInput.trim() || isStreaming} className="p-2.5 bg-slate-700 text-white rounded-xl">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};
