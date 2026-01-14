
import React, { useEffect, useState } from 'react';
import { Customer, AssessmentResult, AssessmentHistoryItem, ViewState } from '../types';
import { generateAssessment } from '../services/geminiService';
import { AlertTriangle, CheckCircle2, Sparkles, AlertCircle, HelpCircle, Activity, Target, RefreshCw, History, Search } from 'lucide-react';
import { Button } from './ui/Button';
import { ThinkingState } from './ui/ThinkingState'; 
import { ScoreGauge } from './ui/ScoreGauge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getHealthColor, getHealthLabel } from '../utils/formatters';

interface Props {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
  onChangeView?: (view: ViewState) => void;
}

const AssessmentView: React.FC<Props> = ({ customer, onUpdate, onChangeView }) => {
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

  const CustomTooltip = ({ active, payload }: any) => {
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
          {d.main_gap && <p className="text-red-600 mt-2 border-t pt-2 max-w-[180px]">{d.main_gap}</p>}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
        <ThinkingState 
            title="AI 正在扫描画像并评估价值..."
            steps={[
                "分析历史拜访纪要中的关键词...",
                "比对竞品分析情报...",
                "计算 MEDDIC 六大维度得分...",
                "识别关键决策人态度缺失 (Gap)...",
                "生成下一阶段跟进脚本..."
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
                <h2 className="text-2xl font-extrabold text-slate-900 mb-3">赢单确定性评估</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                    销售的核心任务是补齐画像。通过 AI 诊断，我们将为您指出当前商机中缺失的关键拼图。
                </p>
                <Button 
                    onClick={handleRunAssessment}
                    size="lg"
                    className="shadow-lg shadow-indigo-200 px-8"
                    icon={Sparkles}
                >
                    立即运行诊断
                </Button>
            </div>
      </div>
    );
  }

  const history = customer.assessmentHistory || [];
  const trend = history.length > 1 ? data.score - history[history.length - 2].score : 0;

  return (
    <div className="h-full overflow-y-auto p-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 custom-scrollbar">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${getHealthColor(data.deal_health).split(' ')[1]}`}></div>
                <div className="relative mb-4">
                    <ScoreGauge score={data.score} trend={trend} size={140} />
                </div>
                <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border mb-4 ${getHealthColor(data.deal_health)}`}>
                        <Activity className="w-3.5 h-3.5" />
                        {getHealthLabel(data.deal_health)}
                    </span>
                    <Button onClick={handleRunAssessment} variant="secondary" size="sm" icon={RefreshCw} className="w-full">重新评估</Button>
                </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-500" /> 赢单指数演变
                  </h3>
              </div>
              
              {/* 修复：确定的 min-h 解决 Recharts 报错 */}
              <div className="flex-1 w-full min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history.length > 0 ? history : [{date: '今天', score: data.score}]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} width={30} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
         {data.categories.map((cat, idx) => (
             <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-300 transition-colors group">
                 <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                         {cat.status === 'Good' ? <CheckCircle2 className="w-5 h-5 text-emerald-500"/> : <AlertCircle className="w-5 h-5 text-amber-500"/>}
                         {cat.name}
                     </h3>
                     <div className={`text-xs font-bold px-2 py-1 rounded ${cat.score >= 70 ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                         {cat.score}分
                     </div>
                 </div>

                 <div className="p-5 flex-1 space-y-4">
                     {cat.missing.length > 0 && (
                        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> 情报缺失 (画像 Gap)
                            </span>
                            <ul className="space-y-1.5">
                                {cat.missing.map((item, i) => (
                                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                     )}
                     
                     <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <div className="p-1.5 bg-indigo-200 rounded-lg text-indigo-700 shrink-0">
                                <HelpCircle className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-indigo-500 uppercase block mb-1">补齐行动建议</span>
                                <p className="text-sm text-indigo-900 font-medium leading-relaxed mb-3">"{cat.coaching_tip}"</p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onChangeView?.(ViewState.WEB_RESEARCH)}
                                        className="text-[10px] bg-white border border-indigo-200 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1 font-bold"
                                    >
                                        <Search className="w-2.5 h-2.5" /> 互联网调研
                                    </button>
                                </div>
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
