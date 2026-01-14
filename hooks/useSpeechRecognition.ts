
import { useState, useRef, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionProps {
    onResult: (transcript: string) => void;
    lang?: string;
    continuous?: boolean;
}

export const useSpeechRecognition = ({ 
    onResult, 
    lang = 'zh-CN', 
    continuous = false 
}: UseSpeechRecognitionProps) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("您的浏览器暂不支持语音输入功能，请使用 Chrome 或 Edge。");
            return;
        }

        if (isListening) return;

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = continuous;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        
        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isListening, lang, continuous, onResult]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        startListening,
        stopListening,
        toggleListening,
        hasSupport: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    };
};
