
import React, { useMemo } from 'react';
import { Customer, Stakeholder, ChatMessage } from '../../types';
import { startRolePlaySession } from '../../services/geminiService';
import { RefreshCw, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { ChatBubble } from '../ui/ChatBubble';
import { useChatStream } from '../../hooks/useChatStream';

interface Props {
  customer: Customer;
  stakeholder: Stakeholder;
  onEndSession: () => void;
}

export const RolePlaySession: React.FC<Props> = ({ customer, stakeholder, onEndSession }) => {
  const initialMessages = useMemo<ChatMessage[]>(() => [
      { 
        id: 'init', 
        role: 'model', 
        text: `(AI 已扮演 ${stakeholder.name} - ${stakeholder.title})\n\n你好，我是${stakeholder.name}。关于你们的方案，我只有几分钟时间，请直奔主题吧。`, 
        timestamp: Date.now() 
      }
  ], [stakeholder.id]);

  const { 
      messages, 
      input, 
      setInput, 
      isStreaming, 
      submitMessage, 
      messagesEndRef 
  } = useChatStream(initialMessages, (history, msg) => startRolePlaySession(history, msg, customer, stakeholder));

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                 {stakeholder.name.charAt(0)}
              </div>
              <div>
                 <div className="font-bold text-slate-800 flex items-center gap-2">
                    {stakeholder.name} 
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold">AI 模拟中</span>
                 </div>
                 <div className="text-xs text-slate-500">{stakeholder.title} • {stakeholder.stance}</div>
              </div>
           </div>
           <Button variant="secondary" size="sm" onClick={onEndSession} icon={RefreshCw}>结束演练</Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
           {messages.map((msg) => (
             <ChatBubble 
                key={msg.id} 
                role={msg.role} 
                text={msg.text} 
                avatarLabel={msg.role === 'model' ? stakeholder.name.charAt(0) : undefined} 
             />
           ))}
           {isStreaming && (
              <ChatBubble role="model" isTyping avatarLabel={stakeholder.name.charAt(0)} />
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
           <div className="flex gap-2 relative">
              <input
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && submitMessage()}
                 placeholder="输入你的话术，开始攻防演练..."
                 className="flex-1 border border-slate-300 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <button 
                  onClick={() => submitMessage()}
                  disabled={!input.trim() || isStreaming}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                  <Send className="w-4 h-4" />
              </button>
           </div>
        </div>
    </div>
  );
};
