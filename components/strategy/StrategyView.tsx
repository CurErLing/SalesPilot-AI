
import React, { useState } from 'react';
import { Customer, ViewState } from '../../types';
import { generateStrategy } from '../../services/geminiService';
import { StrategyActionCenter, StrategyResult } from './StrategyActionCenter';
import { BattleCardsPanel } from './BattleCardsPanel';

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
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 p-1 overflow-y-auto">
      
      {/* LEFT COLUMN: ACTION CENTER (AI Strategy) */}
      <StrategyActionCenter 
          strategy={strategy}
          loading={loading}
          onGenerate={handleGenerate}
          customerStatus={customer.status}
          onStartRolePlay={() => onChangeView && onChangeView(ViewState.ROLE_PLAY)}
      />

      {/* RIGHT COLUMN: BATTLE CARDS (Saved Pitches + Objections) */}
      <BattleCardsPanel 
          customer={customer}
          onUpdate={onUpdate}
          objections={strategy?.objections}
      />
      
    </div>
  );
};

export default StrategyView;
