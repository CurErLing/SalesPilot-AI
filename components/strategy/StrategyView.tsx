
import React, { useState } from 'react';
import { Customer, ViewState } from '../../types';
import { generateStrategy } from '../../services/geminiService';
import { StrategyActionCenter, StrategyResult } from './StrategyActionCenter';
import { BattleCardsPanel } from './BattleCardsPanel';
import { Compass, RefreshCw, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
  onChangeView?: (view: ViewState) => void;
}

const StrategyView: React.FC<Props> = ({ customer, onUpdate, onChangeView }) => {
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateStrategy(customer);
    setStrategy(result);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/50 p-2 gap-4">
      
      {/* 1. Strategy Header / Control Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                  <h2 className="text-lg font-bold text-slate-800">赢单作战室 (War Room)</h2>
                  <p className="text-xs text-slate-500 font-medium">
                      当前战况: <span className="text-indigo-600 font-bold">{customer.status}</span> • 
                      赢面: <span className="font-bold">{customer.assessmentScore || '-'}分</span>
                  </p>
              </div>
          </div>
          <Button 
              onClick={handleGenerate}
              isLoading={loading}
              icon={strategy ? RefreshCw : Zap}
              variant={strategy ? 'secondary' : 'gradient'}
              className="shadow-md"
          >
              {strategy ? "重新制定策略" : "AI 生成致胜策略"}
          </Button>
      </div>

      {/* 2. Main Content Grid */}
      <div className="flex-1 overflow-hidden">
          {loading || !strategy ? (
             <StrategyActionCenter 
                strategy={strategy}
                loading={loading}
                onGenerate={handleGenerate}
                customerStatus={customer.status}
                onStartRolePlay={() => onChangeView && onChangeView(ViewState.ROLE_PLAY)}
             />
          ) : (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-y-auto custom-scrollbar pb-6 pr-2">
                 
                 {/* LEFT: TACTICAL EXECUTION (7 Cols) */}
                 <div className="lg:col-span-7 flex flex-col gap-6">
                     <StrategyActionCenter 
                        strategy={strategy}
                        loading={loading}
                        onGenerate={handleGenerate}
                        customerStatus={customer.status}
                        onStartRolePlay={() => onChangeView && onChangeView(ViewState.ROLE_PLAY)}
                     />
                 </div>

                 {/* RIGHT: ARSENAL (5 Cols) */}
                 <div className="lg:col-span-5 h-full">
                     <BattleCardsPanel 
                        customer={customer}
                        onUpdate={onUpdate}
                        objections={strategy?.objections}
                     />
                 </div>
             </div>
          )}
      </div>
    </div>
  );
};

export default StrategyView;
