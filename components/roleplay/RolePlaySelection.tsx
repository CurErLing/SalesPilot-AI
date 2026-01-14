
import React from 'react';
import { Customer, Stakeholder } from '../../types';
import { Swords, UserPlus } from 'lucide-react';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

interface Props {
  customer: Customer;
  onSelect: (stakeholder: Stakeholder) => void;
}

export const RolePlaySelection: React.FC<Props> = ({ customer, onSelect }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-in fade-in">
      <div className="max-w-2xl w-full text-center space-y-8">
         <div className="space-y-2">
           <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <Swords className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold text-slate-800">AI 实战陪练 (Role Play)</h2>
           <p className="text-slate-500">选择一位决策人，AI 将完全模拟其性格与立场，与您进行一对一的销售攻防演练。</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.persona.decisionMakers && customer.persona.decisionMakers.length > 0 ? (
              customer.persona.decisionMakers.map(dm => (
                <Card 
                  key={dm.id} 
                  onClick={() => onSelect(dm)}
                  className="p-4 hoverable cursor-pointer border-slate-200 hover:border-indigo-500 group text-left"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-white shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                         {dm.name.charAt(0)}
                      </div>
                      <div>
                         <div className="font-bold text-slate-700 group-hover:text-indigo-700">{dm.name}</div>
                         <div className="text-xs text-slate-400">{dm.title} • {dm.role}</div>
                      </div>
                   </div>
                   {dm.stance && (
                      <div className="mt-3 text-xs px-2 py-1 bg-slate-50 rounded inline-block text-slate-500">
                         立场: {dm.stance}
                      </div>
                   )}
                </Card>
              ))
            ) : (
              <div className="col-span-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl py-10">
                 <EmptyState 
                    icon={UserPlus}
                    title="暂无决策人"
                    description="请先在“全景画像”中添加决策人，才能开始演练。"
                 />
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
