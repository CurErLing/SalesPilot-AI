
import React from 'react';
import { User, Bot, Loader2 } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'model';
  text?: string;
  isTyping?: boolean;
  avatarLabel?: string; // e.g., 'A', 'B' or First char of name
  userName?: string; // Optional name to show in tooltip or log
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  role, 
  text, 
  isTyping = false, 
  avatarLabel 
}) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm
          ${isUser ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'}
        `}>
          {avatarLabel ? avatarLabel.charAt(0) : (isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />)}
        </div>

        {/* Bubble Content */}
        {isTyping ? (
           <div className={`bg-white border border-slate-100 p-3 rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} text-xs text-slate-400 flex items-center gap-2 shadow-sm`}>
              <Loader2 className="w-3 h-3 animate-spin" /> 
              <span>思考中...</span>
           </div>
        ) : (
          <div className={`
            p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm
            ${isUser 
              ? 'bg-slate-800 text-white rounded-tr-none' 
              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }
          `}>
            {text}
          </div>
        )}
      </div>
    </div>
  );
};
