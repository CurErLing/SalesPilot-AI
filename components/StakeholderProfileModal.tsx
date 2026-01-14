
import React, { useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Customer, Stakeholder } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { UserCircle, Mail, Phone, Edit2, Calendar, MessageSquare, Briefcase, FileText, Plus } from 'lucide-react';
import { getRoleLabel } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stakeholder: Stakeholder | null;
  customer: Customer;
  onEdit: (stakeholder: Stakeholder) => void;
  onAddInteraction?: (stakeholder: Stakeholder) => void; // New action
}

export const StakeholderProfileModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  stakeholder, 
  customer,
  onEdit,
  onAddInteraction
}) => {
  if (!stakeholder) return null;

  // Smartly filter visits: 1. Check explicit IDs, 2. Fallback to name search
  const relatedVisits = useMemo(() => {
    if (!customer.visits) return [];
    
    return customer.visits.filter(visit => {
      // 1. Explicit Link
      if (visit.stakeholderIds?.includes(stakeholder.id)) {
          return true;
      }

      // 2. Implicit Link
      const searchTerms = [stakeholder.name, stakeholder.title].filter(Boolean);
      const textToSearch = `${visit.title} ${visit.content} ${visit.transcript || ''}`;
      return searchTerms.some(term => textToSearch.includes(term));
    });
  }, [customer.visits, stakeholder]);

  const getStanceBadge = (stance: string) => {
    switch(stance) {
        case 'Champion': return <Badge variant="success" className="px-2">🔥 核心支持者 (Champion)</Badge>;
        case 'Positive': return <Badge variant="success">😊 态度积极</Badge>;
        case 'Neutral': return <Badge variant="neutral">😐 中立</Badge>;
        case 'Negative': return <Badge variant="warning">😟 态度消极</Badge>;
        case 'Blocker': return <Badge className="bg-red-100 text-red-700 border-red-200">⛔ 反对者 (Blocker)</Badge>;
        default: return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-indigo-600" />
            <span>决策人档案</span>
        </div>
      }
      maxWidth="max-w-4xl"
      footer={
        <div className="flex justify-between w-full items-center">
            {/* Left side: Management action */}
            <Button 
                variant="secondary" 
                size="sm" 
                icon={Edit2} 
                onClick={() => { onClose(); onEdit(stakeholder); }}
                className="text-slate-600 border-slate-200"
            >
                编辑资料
            </Button>

            {/* Right side: Core business action */}
            <div className="flex gap-3">
                <Button 
                    icon={Plus} 
                    onClick={() => { onClose(); onAddInteraction?.(stakeholder); }}
                    className="shadow-md shadow-indigo-100"
                >
                    添加互动记录
                </Button>
            </div>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Profile Info */}
          <div className="w-full md:w-1/3 space-y-6">
              <div className="text-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <Avatar name={stakeholder.name} size="xl" className="mx-auto mb-3 border-2 border-white shadow-md bg-indigo-50 text-indigo-600" />
                  
                  <h2 className="text-xl font-bold text-slate-900">{stakeholder.name}</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">{stakeholder.title}</p>
                  
                  <div className="mt-4 flex justify-center">
                      {getStanceBadge(stakeholder.stance)}
                  </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                  <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">角色定位</h4>
                      <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          {getRoleLabel(stakeholder.role)}
                      </div>
                  </div>
                  
                  <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">联系方式</h4>
                      {stakeholder.contact ? (
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                              {stakeholder.contact.includes('@') ? <Mail className="w-4 h-4 text-slate-400"/> : <Phone className="w-4 h-4 text-slate-400"/>}
                              {stakeholder.contact}
                          </div>
                      ) : (
                          <span className="text-xs text-slate-400 italic">未记录联系方式</span>
                      )}
                  </div>

                  <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">个人备注</h4>
                      <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 italic">
                          "{stakeholder.notes || '暂无备注信息...'}"
                      </p>
                  </div>
              </div>
          </div>

          {/* Right Column: Interaction History */}
          <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  互动历史 ({relatedVisits.length})
              </h3>
              
              <div className="space-y-4">
                  {relatedVisits.length > 0 ? (
                      relatedVisits.map((visit) => {
                          const isExplicitLink = visit.stakeholderIds?.includes(stakeholder.id);
                          
                          return (
                            <div key={visit.id} className="relative pl-6 pb-2 border-l-2 border-slate-100 last:border-0 group">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 transition-colors ${isExplicitLink ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200'}`}></div>
                                
                                <div className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all cursor-default relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded">
                                                <Calendar className="w-3 h-3" /> {visit.date}
                                            </span>
                                            {isExplicitLink && <Badge variant="neutral" className="text-[9px] px-1 py-0">已关联</Badge>}
                                        </div>
                                        <span className="text-xs text-slate-400">{visit.type}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1">{visit.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {visit.content}
                                    </p>
                                </div>
                            </div>
                          );
                      })
                  ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                          <FileText className="w-10 h-10 mb-2 opacity-50" />
                          <p className="text-sm">暂无与该决策人直接关联的互动记录</p>
                          <p className="text-xs mt-1">请在“拜访记录”中编辑记录并手动关联该决策人</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </Modal>
  );
};
