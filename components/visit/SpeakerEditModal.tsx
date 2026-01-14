
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { User, Check, Users } from 'lucide-react';
import { Stakeholder } from '../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialName: string;
    onSave: (newName: string) => void;
    stakeholders?: Stakeholder[];
}

export const SpeakerEditModal: React.FC<Props> = ({ isOpen, onClose, initialName, onSave, stakeholders = [] }) => {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
        }
    }, [isOpen, initialName]);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2 text-slate-800">
                    <User className="w-5 h-5 text-indigo-600" />
                    <span>编辑发言人</span>
                </div>
            }
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <Button variant="secondary" onClick={onClose} className="flex-1">取消</Button>
                    <Button onClick={handleSave} disabled={!name.trim()} className="flex-1 shadow-lg shadow-indigo-200">
                        保存
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 pt-2 pb-4">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">显示名称</label>
                    <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className="w-full p-3 text-base border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium"
                        placeholder="输入发言人姓名"
                    />
                </div>

                {/* Link Stakeholder */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> 关联实际参会人
                    </label>
                    
                    {stakeholders.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setName("我")}
                                className={`px-3 py-2.5 rounded-lg text-sm font-medium border text-left transition-all ${name === "我" ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                            >
                                我 (销售)
                            </button>
                            {stakeholders.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setName(s.name)}
                                    className={`px-3 py-2.5 rounded-lg text-sm font-medium border text-left transition-all flex items-center justify-between group ${name === s.name ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                >
                                    <span className="truncate">{s.name}</span>
                                    {name === s.name && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    ) : (
                         <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-400 text-center">
                            暂无决策人信息，请先在“全景画像”中添加
                        </div>
                    )}
                </div>
                
                <p className="text-xs text-slate-400">
                    提示：关联后，系统将自动把该发言人的后续对话归档至对应决策人的互动历史中。
                </p>
            </div>
        </Modal>
    );
};
