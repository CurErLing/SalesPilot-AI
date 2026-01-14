
import React, { useEffect, useState } from 'react';
import { Customer, AssessmentResult, AssessmentHistoryItem } from '../types';
import { generateAssessment } from '../services/geminiService';
import { AlertTriangle, CheckCircle2, Sparkles, AlertCircle, HelpCircle, Activity, Target, RefreshCw, History } from 'lucide-react';
import { Button } from './ui/Button';
import { ThinkingState } from './ui/ThinkingState'; 
import { ScoreGauge } from './ui/ScoreGauge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getHealthColor, getHealthLabel } from '../utils/formatters';

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

        // Create History Entry
        const mainGap = typedResult.categories.find(c => c.status === 'Gap')?.missing?.[0];
        const newHistoryItem: AssessmentHistoryItem = {
            date: new Date().toISOString().split('T')[0],
            score: typedResult.score,
            deal_health: typedResult.deal_health,
            main_gap: mainGap
        };

        const updatedHistory = [...(customer.assessmentHistory || []), newHistoryItem];

        onUpdate({
            ...customer,
            assessmentScore: typedResult.score,
            assessmentResult: typedResult,
            assessmentHistory: updatedHistory
        });
    } catch (e) {
        console.error("Assessment failed", e);
    } finally {
        setLoading(false);
    }
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload as AssessmentHistoryItem;
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-xs z-50">
          <p className="text-slate-400 mb-1">{d.date}</p>
          <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-800">评分: {d.score}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                  d.deal_health === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 
                  d.deal_health === 'At Risk' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                  {d.deal_health}
              </span>
          </div>
          {d.main_gap && (
              <div className="mt-2 pt-2 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                      <AlertCircle className="w-3 h-3 text-red-400" /> 主要风险:
                  </p>
                  <p className="text-red-600 max-w-[180px] leading-snug">{d.main_gap}</p>
              </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
        <ThinkingState 
            title="AI 正在进行全维度价值评估..."
            steps={[
                "读取客户全景画像数据...",
                "分析历史拜访记录与情感倾向...",
                "比对 MEDDIC 模型六大维度...",
                "计算赢单概率与健康度...",
                "生成针对性改进建议 (Coaching Tips)..."
            ]}
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

  // Determine trend arrow
  const history = customer.assessmentHistory || [];
  const previousScore = history.length > 1 ? history[history.length - 2].score : data.score;
  const trend = data.score - previousScore;

  // Results View
  return (
    <div className="h-full overflow-y-auto p-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Section: Split into Current Status & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Current Score Gauge */}
          <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${getHealthColor(data.deal_health).split(' ')[1].replace('bg-', 'bg-')}`}></div>
                
                <div className="relative mb-4">
                    <ScoreGauge score={data.score} trend={trend} size={128} />
                </div>

                <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border mb-3 ${getHealthColor(data.deal_health)}`}>
                        <Activity className="w-3.5 h-3.5" />
                        {getHealthLabel(data.deal_health)}
                    </span>
                    <Button 
                        onClick={handleRunAssessment} 
                        variant="secondary" 
                        size="sm" 
                        icon={RefreshCw}
                        className="w-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 shadow-sm"
                    >
                        重新评估
                    </Button>
                </div>
          </div>

          {/* Right: History Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-500" /> 
                      评分历史演变
                  </h3>
                  {history.length <= 1 && (
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">暂无足够历史数据</span>
                  )}
              </div>
              
              <div className="flex-1 w-full relative min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history.length > 0 ? history : [{date: new Date().toISOString().split('T')[0], score: data.score}]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                              dataKey="date" 
                              tick={{fontSize: 10, fill: '#94a3b8'}} 
                              axisLine={false} 
                              tickLine={false} 
                              padding={{ left: 10, right: 10 }}
                          />
                          <YAxis 
                              domain={[0, 100]} 
                              tick={{fontSize: 10, fill: '#94a3b8'}} 
                              axisLine={false} 
                              tickLine={false} 
                              width={30}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#6366f1" 
                              strokeWidth={3} 
                              dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                              activeDot={{ r: 6, fill: '#4f46e5' }}
                              animationDuration={1500}
                          />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm mb-1">AI 诊断综述</h3>
          <p className="text-slate-600 leading-relaxed font-medium text-sm">
                {data.summary}
          </p>
      </div>

      {/* Grid: Gap Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
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
