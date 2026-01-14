
import React, { useEffect, useState } from 'react';
import { Customer, AssessmentResult } from '../types';
import { generateAssessment } from '../services/geminiService';
import { TrendingUp, AlertTriangle, CheckCircle2, BarChart3, Sparkles, AlertCircle, HelpCircle, Activity, Target, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { LoadingState } from './ui/LoadingState';

interface Props {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
}

const AssessmentView: React.FC<Props> = ({ customer, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AssessmentResult | null>(customer.assessmentResult || null);

  useEffect(() => {
    setData(customer.assessmentResult || null);
  }, [customer.id, customer.assessmentResult]);

  const handleRunAssessment = async () => {
    setLoading(true);
    try {
        const result = await generateAssessment(customer);
        const typedResult = result as AssessmentResult;
        setData(typedResult);
        onUpdate({
            ...customer,
            assessmentScore: typedResult.score,
            assessmentResult: typedResult
        });
    } catch (e) {
        console.error("Assessment failed", e);
    } finally {
        setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
      switch(health) {
          case 'Healthy': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
          case 'At Risk': return 'text-amber-500 bg-amber-50 border-amber-200';
          case 'Critical': return 'text-red-500 bg-red-50 border-red-200';
          default: return 'text-slate-500 bg-slate-50 border-slate-200';
      }
  };

  const getHealthLabel = (health: string) => {
      switch(health) {
          case 'Healthy': return '优质客户 (Healthy)';
          case 'At Risk': return '存在风险 (At Risk)';
          case 'Critical': return '低价值/危险 (Critical)';
          default: return health;
      }
  };

  if (loading) {
    return (
        <LoadingState 
            icon={BarChart3}
            title="AI 正在进行全维度价值评估..."
            subtitle="基于 MEDDIC/BANT 模型分析画像完整度与赢单概率"
        />
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-6 p-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200 mb-4 transform rotate-3 hover:rotate-0 transition-all duration-500">
                <Target className="w-12 h-12 text-white" />
            </div>
            <div className="text-center max-w-md">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-3">客户价值评估</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                    根据客户画像数据，进行自动化评级与筛选。<br/>
                    AI 将基于 MEDDIC/BANT 模型，识别优质客户，并制定下一步跟进策略。
                </p>
                <Button 
                    onClick={handleRunAssessment}
                    size="lg"
                    className="shadow-lg shadow-indigo-200 px-8"
                    icon={Sparkles}
                >
                    开始自动化评级
                </Button>
            </div>
      </div>
    );
  }

  // Results View
  return (
    <div className="h-full overflow-y-auto p-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner: Deal Health & Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-2 h-full ${getHealthColor(data.deal_health).split(' ')[1].replace('bg-', 'bg-')}`}></div>
        
        {/* Score Gauge */}
        <div className="relative flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle 
                    cx="64" 
                    cy="64" 
                    r="56" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={351} 
                    strokeDashoffset={351 - (351 * data.score) / 100} 
                    strokeLinecap="round"
                    className={`${data.score >= 70 ? 'text-emerald-500' : data.score >= 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800">{data.score}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">价值评分</span>
            </div>
        </div>

        {/* Health Text & Summary */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${getHealthColor(data.deal_health)}`}>
                        <Activity className="w-3.5 h-3.5" />
                        {getHealthLabel(data.deal_health)}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline-block">基于画像自动化评级</span>
                </div>
                
                {/* Update Button */}
                <Button 
                    onClick={handleRunAssessment} 
                    variant="secondary" 
                    size="sm" 
                    icon={RefreshCw}
                    className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 shadow-sm"
                >
                    重新评估
                </Button>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
                {data.summary}
            </p>
        </div>
    </div>

      {/* Grid: Gap Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         {data.categories.map((cat, idx) => (
             <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
                 {/* Header */}
                 <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                         {cat.status === 'Good' ? <CheckCircle2 className="w-5 h-5 text-emerald-500"/> : <AlertCircle className="w-5 h-5 text-amber-500"/>}
                         {cat.name}
                     </h3>
                     <div className={`text-xs font-bold px-2 py-1 rounded ${cat.score >= 70 ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                         {cat.score}分
                     </div>
                 </div>

                 {/* Content */}
                 <div className="p-5 flex-1 space-y-5">
                     
                     {/* Evidence */}
                     {cat.evidence.length > 0 && (
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">已验证信息</span>
                            <ul className="space-y-1.5">
                                {cat.evidence.map((item, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        <span className="opacity-90 leading-snug">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                     )}

                     {/* Missing / Gap */}
                     {cat.missing.length > 0 ? (
                        <div>
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> 画像缺失 (Gap)
                            </span>
                            <ul className="space-y-1.5">
                                {cat.missing.map((item, i) => (
                                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-amber-50/50 p-1.5 rounded border border-amber-100/50">
                                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                        <span className="leading-snug">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                     ) : (
                         <div className="p-3 bg-emerald-50 rounded text-xs text-emerald-700 flex items-center justify-center gap-2">
                             <CheckCircle2 className="w-4 h-4" /> 该维度信息完整
                         </div>
                     )}
                     
                     {/* Coaching Tip */}
                     <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <div className="p-1.5 bg-indigo-200 rounded-full text-indigo-700 shrink-0 mt-0.5">
                                <HelpCircle className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide block mb-0.5">跟进策略 / 提问建议</span>
                                <p className="text-sm text-indigo-900 font-medium leading-snug">
                                    "{cat.coaching_tip}"
                                </p>
                            </div>
                        </div>
                     </div>
                 </div>
             </div>
         ))}
      </div>

    </div>
  );
};

export default AssessmentView;
