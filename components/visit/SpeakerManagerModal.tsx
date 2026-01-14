
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Edit2, User, Users } from 'lucide-react';
import { SpeakerEditModal } from './SpeakerEditModal';
import { Stakeholder } from '../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    speakers: string[];
    onRename: (oldName: string, newName: string) => void;
    stakeholders?: Stakeholder[];
}

export const SpeakerManagerModal: React.FC<Props> = ({ isOpen, onClose, speakers, onRename, stakeholders }) => {
    // State to control the nested edit modal
    const [editingSpeakerName, setEditingSpeakerName] = useState<string | null>(null);

    const handleRenameSave = (newName: string) => {
        if (editingSpeakerName && newName !== editingSpeakerName) {
            onRename(editingSpeakerName, newName);
        }
        setEditingSpeakerName(null);
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span>发言人管理</span>
                    </div>
                }
                description="统一管理本次录音的发言人角色。"
                maxWidth="max-w-md"
                footer={<Button onClick={onClose} className="w-full">完成</Button>}
            >
                <div className="space-y-3">
                    {speakers.map((speaker, idx) => (
                        <div key={`${speaker}-${idx}`} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all group">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                    idx % 2 === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                    {speaker.charAt(0)}
                                </div>
                                <div className="flex-1 font-bold text-slate-700">
                                    {speaker}
                                </div>
                            </div>

                            <button 
                                onClick={() => setEditingSpeakerName(speaker)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="修改发言人"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {speakers.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            <User className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="text-xs">暂无识别到的发言人</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Nested Edit Modal */}
            {editingSpeakerName && (
                <SpeakerEditModal 
                    isOpen={!!editingSpeakerName}
                    onClose={() => setEditingSpeakerName(null)}
                    initialName={editingSpeakerName}
                    onSave={handleRenameSave}
                    stakeholders={stakeholders}
                />
            )}
        </>
    );
};
