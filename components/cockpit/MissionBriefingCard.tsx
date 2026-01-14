
import React from 'react';
import { BrainCircuit, AlertCircle, CheckCircle2, Sparkles, ArrowRight, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { AssessmentResult, ViewState } from '../../types';

interface Props {
    assessment?: AssessmentResult;
    assessmentGaps: { name: string; missing: string[] }[];
    onChangeView: (view: ViewState) => void;
}

export const MissionBriefingCard: React.FC<Props> = ({ assessment, assessmentGaps, onChangeView }) => {
    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden border border-slate-100 group">
            {/* Subtle decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${assessment ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-none">
                            {assessment ? "价值评估结论" : "AI 作战简报"}
                        </h3>
                        {assessment && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${
                                assessment.deal_health === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 
                                assessment.deal_health === 'At Risk' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {assessment.deal_health === 'Healthy' ? '健康' : assessment.deal_health === 'At Risk' ? '存在风险' : '高危'}
                            </span>
                        )}
                    </div>
                </div>

                {assessment ? (
                    <>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                            {assessment.summary}
                        </p>

                        {/* Key Gaps / Points */}
                        {assessmentGaps.length > 0 ? (
                            <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 mb-6">
                                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> 关键风险 (Gaps)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {assessmentGaps.map((gap, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></div>
                                            <span className="text-sm text-slate-700">{gap.name}: {gap.missing[0] || '信息缺失'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 mb-6 flex items-center gap-3 text-emerald-700 text-sm font-medium">
                                <CheckCircle2 className="w-5 h-5" />
                                关键维度信息完备，建议推进至下一阶段。
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-4 mb-4">
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                            暂无评估数据。AI 尚未对该客户进行 MEDDIC 模型验证。
                            <br/>建议完善画像后运行评估，以获取精准的赢单策略。
                        </p>
                    </div>
                )}
                
                <div className="flex flex-wrap gap-3">
                    {!assessment ? (
                        <Button 
                            size="sm" 
                            variant="gradient" 
                            onClick={() => onChangeView(ViewState.ASSESSMENT)}
                            icon={Sparkles}
                            className="shadow-md"
                        >
                            立即进行价值评估
                        </Button>
                    ) : (
                        <Button 
                          size="sm" 
                          variant="gradient" 
                          onClick={() => onChangeView(ViewState.STRATEGY)}
                          icon={ArrowRight}
                          className="shadow-md shadow-indigo-200"
                        >
                            生成致胜策略
                        </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 shadow-sm"
                      onClick={() => onChangeView(ViewState.CHAT)}
                      icon={FileText}
                    >
                        询问项目细节
                    </Button>
                </div>
            </div>
        </div>
    );
};
