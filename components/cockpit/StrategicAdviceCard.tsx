
import React from 'react';
import { Target, ArrowRight, Zap, Lightbulb } from 'lucide-react';
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

    const colorMap = {
        indigo: 'bg-indigo-600 shadow-indigo-200',
        red: 'bg-red-600 shadow-red-200',
        emerald: 'bg-emerald-600 shadow-emerald-200'
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg shadow-slate-100 relative overflow-hidden group">
            {/* Background Effect */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${themeColor}-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-colors duration-500`}></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg bg-${themeColor}-50 text-${themeColor}-600`}>
                        <Zap className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-${themeColor}-900 tracking-tight`}>AI 战术指引</h3>
                </div>

                <h2 className="text-xl font-extrabold text-slate-800 mb-2 leading-tight">
                    {actionTitle}
                </h2>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                    {actionDesc}
                </p>

                <div className="flex items-center justify-between">
                    {assessment?.categories[0]?.coaching_tip && (
                        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 max-w-[60%]">
                            <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">Tip: {assessment.categories[0].coaching_tip}</span>
                        </div>
                    )}
                    
                    <Button 
                        onClick={() => onChangeView(viewTarget)}
                        className={`${colorMap[themeColor as keyof typeof colorMap]} text-white border-transparent`}
                        icon={ArrowRight}
                    >
                        {buttonLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};
