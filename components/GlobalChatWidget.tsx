
import React, { useState } from 'react';
import { Customer } from '../types';
import { Bot, X, MessageSquareText, Swords } from 'lucide-react';
import { ChatMode } from './chat/ChatMode';
import { RolePlayMode } from './chat/RolePlayMode';

interface Props {
  customer: Customer;
}

type Mode = 'CHAT' | 'ROLE_PLAY';

export const GlobalChatWidget: React.FC<Props> = ({ customer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('CHAT');

  return (
    <>
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed bottom-12 right-8 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-tr from-indigo-600 to-purple-600'}`}
        >
            {isOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-7 h-7 text-white" />}
        </button>

        {isOpen && (
            <>
                {/* Backdrop for click-outside-to-close */}
                <div 
                    className="fixed inset-0 z-30 bg-black/5 cursor-default" 
                    onClick={() => setIsOpen(false)}
                />

                <div className="fixed bottom-32 right-8 z-40 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
                    
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-slate-200 shrink-0">
                        <div className="p-3 flex items-center gap-2">
                            <div className="flex-1 flex bg-slate-200/50 p-1 rounded-lg">
                                <button 
                                    onClick={() => setMode('CHAT')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${mode === 'CHAT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <MessageSquareText className="w-3.5 h-3.5" /> 全景问答
                                </button>
                                <button 
                                    onClick={() => setMode('ROLE_PLAY')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${mode === 'ROLE_PLAY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Swords className="w-3.5 h-3.5" /> 实战陪练
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-hidden bg-slate-50/30 relative">
                        {mode === 'CHAT' ? (
                            <ChatMode customer={customer} />
                        ) : (
                            <RolePlayMode customer={customer} />
                        )}
                    </div>
                </div>
            </>
        )}
    </>
  );
};
