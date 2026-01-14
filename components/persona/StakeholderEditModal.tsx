
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Stakeholder, Customer } from '../../types'; // Added Customer type import if needed context, though simple list works
import { Trash2, Mail, GitFork } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Stakeholder>) => void;
    onDelete: (id: string) => void;
    initialData: Partial<Stakeholder> | null;
    // We need the full list to select a manager
    allStakeholders?: Stakeholder[];
}

export const StakeholderEditModal: React.FC<Props> = ({ isOpen, onClose, onSave, onDelete, initialData, allStakeholders = [] }) => {
    const [data, setData] = useState<Partial<Stakeholder>>({});

    useEffect(() => {
        if (isOpen) {
            setData(initialData || {});
        }
    }, [isOpen, initialData]);

    const getStanceColor = (stance: string) => {
        switch(stance) {
            case 'Champion': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Positive': return 'bg-green-50 text-green-600 border-green-200';
            case 'Negative': return 'bg-red-50 text-red-600 border-red-200';
            case 'Blocker': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStanceLabel = (s: string) => {
        switch(s) {
            case 'Champion': return '🔥 核心支持者';
            case 'Positive': return '🙂 态度积极';
            case 'Neutral': return '😐 中立';
            case 'Negative': return '😟 态度消极';
            case 'Blocker': return '⛔ 反对者';
            default: return s;
        }
    };

    // Filter out self to avoid circular reference in dropdown (basic level)
    const potentialManagers = useMemo(() => {
        return allStakeholders.filter(s => s.id !== data.id);
    }, [allStakeholders, data.id]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={data.id ? "编辑决策人信息" : "添加决策人"}
            footer={
                <div className="flex justify-between w-full">
                    {data.id ? (
                        <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(data.id!)}>删除</Button>
                    ) : <div></div>}
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose}>取消</Button>
                        <Button onClick={() => onSave(data)} disabled={!data.name}>保存</Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">姓名 <span className="text-red-500">*</span></label>
                        <input
                            className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={data.name || ''}
                            onChange={e => setData({ ...data, name: e.target.value })}
                            placeholder="输入姓名"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">职位</label>
                        <input
                            className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={data.title || ''}
                            onChange={e => setData({ ...data, title: e.target.value })}
                            placeholder="例如：CIO / 采购总监"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">角色定位</label>
                    <select
                        className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={data.role || 'Unknown'}
                        onChange={e => setData({ ...data, role: e.target.value as any })}
                    >
                        <option value="Unknown">未知 (需进一步确认)</option>
                        <option value="Economic Buyer">经济决策人 (EB) - 掌管预算/最终拍板</option>
                        <option value="Technical Buyer">技术把关人 (TB) - 评估可行性/否决权</option>
                        <option value="User Buyer">最终用户 (UB) - 实际使用/提出需求</option>
                        <option value="Coach">教练 (Coach) - 内部线人/提供情报</option>
                        <option value="Gatekeeper">把关人 (Gatekeeper) - 秘书/助理</option>
                        <option value="Influencer">影响者 (Influencer) - 外部专家/顾问</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                        {data.role === 'Economic Buyer' && "负责最终签字和预算批准的关键人物。"}
                        {data.role === 'Coach' && "不仅希望我们赢，还能提供内部情报的人。"}
                    </p>
                </div>

                {/* Reporting Line */}
                <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                         <GitFork className="w-3.5 h-3.5" /> 汇报对象 (Reports To)
                     </label>
                     <select
                        className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={data.reportsTo || ''}
                        onChange={e => setData({ ...data, reportsTo: e.target.value || undefined })}
                    >
                        <option value="">-- 无 / 最高决策人 --</option>
                        {potentialManagers.map(manager => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name} ({manager.title})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">对我很支持？(立场)</label>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {['Champion', 'Positive', 'Neutral', 'Negative', 'Blocker'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setData({ ...data, stance: s as any })}
                                className={`flex-1 min-w-[80px] py-2 text-xs font-medium rounded border transition-all whitespace-nowrap ${data.stance === s
                                        ? getStanceColor(s) + ' ring-2 ring-offset-1 ring-slate-200'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {getStanceLabel(s)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">联系方式</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full pl-9 p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="邮箱或电话号码"
                            value={data.contact || ''}
                            onChange={e => setData({ ...data, contact: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">个人备注</label>
                    <textarea
                        className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none text-sm"
                        placeholder="记录个人偏好、性格特点或家庭情况（用于建立关系）..."
                        value={data.notes || ''}
                        onChange={e => setData({ ...data, notes: e.target.value })}
                    />
                </div>
            </div>
        </Modal>
    );
};
