
import React from 'react';
import { ArrowRight, Zap, Lightbulb } from 'lucide-react';
import { Button } from '../ui/Button';
import { AssessmentResult, ViewState } from '../../types';

interface Props {
    assessment?: AssessmentResult;
    onChangeView: (view: ViewState) => void;
}

export const StrategicAdviceCard: React.FC<Props> = ({ assessment, onChangeView }) => {
    
    // Logic to derive the "Next Best Action"
    let actionTitle = "启动价值评估";
    let actionDesc = "目前缺乏足够的结构化数据，AI 无法生成精准策略。请先运行 MEDDIC 评估。";
    let buttonLabel = "去评估";
    let viewTarget = ViewState.ASSESSMENT;
    let themeColor = "indigo"; // default

    if (assessment) {
        // 1. If critical gaps exist
        const criticalGap = assessment.categories.find(c => c.status === 'Gap');
        
        if (assessment.deal_health === 'Critical' || assessment.deal_health === 'At Risk') {
            actionTitle = "风险阻断行动";
            actionDesc = criticalGap 
                ? `检测到在“${criticalGap.name}”维度存在重大缺失：${criticalGap.missing[0]}。建议立即安排针对性沟通。`
                : assessment.summary;
            buttonLabel = "查看策略详情";
            viewTarget = ViewState.STRATEGY;
            themeColor = "red";
        } else {
            // 2. If healthy, push for close
            actionTitle = "推进下一阶段";
            actionDesc = "项目健康度良好。建议重点关注合同流程与采购审批，防止最后时刻的意外阻滞。";
            buttonLabel = "制定推进计划";
            viewTarget = ViewState.STRATEGY;
            themeColor = "emerald";
        }
    }

    // Static style map to avoid dynamic class issues in Tailwind
    const styles = {
        indigo: {
            bgEffect: 'bg-indigo-50',
            iconBg: 'bg-indigo-50',
            iconText: 'text-indigo-600',
            headerText: 'text-indigo-900',
            button: '!bg-indigo-600 hover:!bg-indigo-700 shadow-indigo-200'
        },
        red: {
            bgEffect: 'bg-red-50',
            iconBg: 'bg-red-50',
            iconText: 'text-red-600',
            headerText: 'text-red-900',
            button: '!bg-red-600 hover:!bg-red-700 shadow-red-200'
        },
        emerald: {
            bgEffect: 'bg-emerald-50',
            iconBg: 'bg-emerald-50',
            iconText: 'text-emerald-600',
            headerText: 'text-emerald-900',
            button: '!bg-emerald-600 hover:!bg-emerald-700 shadow-emerald-200'
        }
    };

    const currentStyle = styles[themeColor as keyof typeof styles];

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg shadow-slate-100 relative overflow-hidden group h-full flex flex-col">
            {/* Background Effect */}
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 transition-colors duration-500 pointer-events-none z-0 ${currentStyle.bgEffect}`}></div>

            <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg ${currentStyle.iconBg} ${currentStyle.iconText}`}>
                        <Zap className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold tracking-tight ${currentStyle.headerText}`}>AI 战术指引</h3>
                </div>

                <h2 className="text-xl font-extrabold text-slate-800 mb-3 leading-tight">
                    {actionTitle}
                </h2>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                    {actionDesc}
                </p>

                {/* Footer Action Area - Use mt-auto to push to bottom if container has height */}
                <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {assessment?.categories[0]?.coaching_tip && (
                            <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full sm:w-fit">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span className="break-words line-clamp-2 leading-relaxed">
                                    Tip: {assessment.categories[0].coaching_tip}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-shrink-0 w-full sm:w-auto">
                        <Button 
                            onClick={() => onChangeView(viewTarget)}
                            className={`w-full sm:w-auto ${currentStyle.button} text-white border-transparent justify-center`}
                            icon={ArrowRight}
                        >
                            {buttonLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
