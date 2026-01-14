
import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, BrainCircuit, Terminal } from 'lucide-react';

interface Props {
    steps: string[];
    title?: string;
}

export const ThinkingState: React.FC<Props> = ({ steps, title = "AI 正在深度思考..." }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (currentStep < steps.length) {
            // Add current step to logs
            setLogs(prev => [...prev, `> ${steps[currentStep]}...`]);

            const timeout = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1500); // Advance every 1.5 seconds to simulate work

            return () => clearTimeout(timeout);
        } else {
            setLogs(prev => [...prev, `> 完成。`]);
        }
    }, [currentStep, steps]);

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50 animate-in fade-in duration-500">
            <div className="w-full max-w-md space-y-8">
                
                {/* Header Icon */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-indigo-100 flex items-center justify-center relative z-10">
                            <BrainCircuit className="w-8 h-8 text-indigo-600 animate-pulse" />
                        </div>
                        {/* Orbiting particles */}
                        <div className="absolute top-0 left-0 w-full h-full animate-spin duration-3000 pointer-events-none">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-glow"></div>
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                </div>

                {/* Steps List */}
                <div className="space-y-3 pl-4 relative">
                    {/* Connection Line */}
                    <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200"></div>

                    {steps.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        const isPending = idx > currentStep;

                        return (
                            <div key={idx} className={`relative flex items-center gap-4 transition-all duration-500 ${isPending ? 'opacity-40 blur-[0.5px]' : 'opacity-100'}`}>
                                {/* Status Icon */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                                    isCompleted ? 'bg-emerald-500 text-white scale-100' : 
                                    isCurrent ? 'bg-indigo-600 text-white scale-110 ring-4 ring-indigo-100' : 
                                    'bg-slate-200 border-2 border-white'
                                }`}>
                                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                                     isCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
                                     <div className="w-2 h-2 bg-white rounded-full"></div>
                                    }
                                </div>

                                {/* Text */}
                                <span className={`text-sm font-medium transition-colors ${
                                    isCompleted ? 'text-slate-500' : 
                                    isCurrent ? 'text-indigo-700' : 
                                    'text-slate-400'
                                }`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Mini Terminal Log */}
                <div className="mt-6 bg-slate-900 rounded-lg p-4 font-mono text-[10px] text-emerald-400 shadow-inner h-24 overflow-hidden flex flex-col justify-end border border-slate-700 opacity-90">
                    <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-1 mb-1">
                        <Terminal className="w-3 h-3" />
                        <span>AI_CORE_PROCESS.log</span>
                    </div>
                    {logs.slice(-3).map((log, i) => (
                        <div key={i} className="animate-in slide-in-from-left-2 fade-in">{log}</div>
                    ))}
                    <div className="animate-pulse">_</div>
                </div>

            </div>
        </div>
    );
};
