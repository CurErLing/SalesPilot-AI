
import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

export const useChatStream = (
    initialMessages: ChatMessage[] = [],
    onSendMessage: (history: any[], message: string) => Promise<any>
) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Reset messages if initialMessages changes (e.g. switching characters)
    useEffect(() => {
        if (initialMessages.length > 0) {
             setMessages(initialMessages);
        }
    }, [initialMessages]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming]);

    const submitMessage = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim() || isStreaming) return;

        const userMsg: ChatMessage = { 
            id: Date.now().toString(), 
            role: 'user', 
            text: textToSend, 
            timestamp: Date.now() 
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsStreaming(true);

        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        try {
            // Note: History passed to Gemini should not include the new user message, as that is passed as the argument
            const streamResult = await onSendMessage(history, textToSend);
            
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
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: '抱歉，遇到了一些问题，请重试。', timestamp: Date.now() }]);
        } finally {
            setIsStreaming(false);
        }
    };

    return {
        messages,
        setMessages,
        input,
        setInput,
        isStreaming,
        submitMessage,
        messagesEndRef
    };
};
