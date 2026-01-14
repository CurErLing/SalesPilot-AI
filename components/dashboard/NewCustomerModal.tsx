
import React, { useState } from 'react';
import { Customer } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (customer: Customer) => void;
}

export const NewCustomerModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
    const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
        name: '',
        projectName: '',
        status: '线索',
        persona: {
          industry: '',
          companySize: '',
          keyPainPoints: [],
          currentSolution: '',
          decisionMakers: [],
          budget: '',
          projectTimeline: '',
          competitors: []
        }
    });

    const handleCreate = () => {
        if (!newCustomer.name || !newCustomer.projectName) return;
        
        const customer: Customer = {
          id: Date.now().toString(),
          name: newCustomer.name,
          projectName: newCustomer.projectName,
          updatedAt: new Date().toISOString().split('T')[0],
          status: '线索',
          lastContact: new Date().toISOString().split('T')[0],
          notes: '',
          visits: [],
          researchNotes: [],
          persona: {
              ...newCustomer.persona!,
              keyPainPoints: [],
              decisionMakers: [],
              competitors: []
          }
        };
    
        onAdd(customer);
        onClose();
        // Reset form
        setNewCustomer({
            name: '',
            projectName: '',
            status: '线索',
            persona: {
                industry: '',
                companySize: '',
                keyPainPoints: [],
                currentSolution: '',
                decisionMakers: [],
                budget: '',
                projectTimeline: '',
                competitors: []
            }
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="新建商机"
            description="填写基本信息以启动新的销售机会。"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>取消</Button>
                    <Button onClick={handleCreate} disabled={!newCustomer.name || !newCustomer.projectName}>创建商机</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">项目名称 <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        placeholder="例如：某集团数字化转型项目"
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newCustomer.projectName}
                        onChange={e => setNewCustomer({...newCustomer, projectName: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">客户名称 (公司) <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        placeholder="例如：未来科技有限公司"
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newCustomer.name}
                        onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">所属行业</label>
                        <input 
                            type="text" 
                            placeholder="例如：互联网/软件"
                            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newCustomer.persona?.industry}
                            onChange={e => setNewCustomer({
                                ...newCustomer, 
                                persona: { ...newCustomer.persona!, industry: e.target.value }
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">公司规模</label>
                        <input 
                            type="text" 
                            placeholder="例如：500人以上"
                            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newCustomer.persona?.companySize}
                            onChange={e => setNewCustomer({
                                ...newCustomer, 
                                persona: { ...newCustomer.persona!, companySize: e.target.value }
                            })}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
