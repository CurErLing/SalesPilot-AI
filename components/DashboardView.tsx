import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { Button } from './ui/Button';
import { Plus } from 'lucide-react';
import { getStatusColor } from '../utils/formatters';

// Sub Components
import { ActionCenter } from './dashboard/ActionCenter';
import { DashboardToolbar } from './dashboard/DashboardToolbar';
import { CustomerCard } from './dashboard/CustomerCard';
import { NewCustomerModal } from './dashboard/NewCustomerModal';

interface Props {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onAddCustomer: (customer: Customer) => void;
}

const DashboardView: React.FC<Props> = ({ customers, onSelectCustomer, onAddCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'score' | 'budget'>('recent');

  // --- Aggregation Logic for Action Center ---
  const actionCenterData = useMemo(() => {
      const today = new Date();
      const risks: Array<{ customer: Customer; daysInactive: number; reason: string }> = [];
      const tasks: Array<{ type: 'meeting' | 'todo'; date: string; content: string; customer: Customer }> = [];

      customers.forEach(c => {
          // 1. Identify Risks (Active deals with > 7 days inactivity)
          if (c.status !== '赢单' && c.status !== '输单') {
              const last = new Date(c.lastContact).getTime();
              const diff = Math.floor((today.getTime() - last) / (1000 * 3600 * 24));
              if (diff > 7) {
                  risks.push({ 
                      customer: c, 
                      daysInactive: diff,
                      reason: '长期未跟进'
                  });
              }
          }

          // 2. Identify Tasks (Planned Meetings OR Next Steps from latest visit)
          c.visits.forEach(v => {
              if (v.status === 'Planned') {
                  tasks.push({
                      type: 'meeting',
                      date: v.date,
                      content: v.title || v.visitGoal || '计划外拜访',
                      customer: c
                  });
              }
          });

          if (c.visits.length > 0) {
              const latest = c.visits[0];
              if (latest.nextSteps && latest.status === 'Completed') {
                  tasks.push({
                      type: 'todo',
                      date: latest.date,
                      content: latest.nextSteps,
                      customer: c
                  });
              }
          }
      });

      return { risks, tasks };
  }, [customers]);

  // --- Filtering & Sorting Logic ---
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => {
        const matchesSearch = 
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.persona.industry || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime();
        }
        if (sortBy === 'score') {
          return (b.assessmentScore || 0) - (a.assessmentScore || 0);
        }
        if (sortBy === 'budget') {
          // Naive string parsing for ¥3,500,000 style
          const getVal = (s: string) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
          return getVal(b.persona.budget) - getVal(a.persona.budget);
        }
        return 0;
      });
  }, [customers, searchQuery, statusFilter, sortBy]);

  return (
    <div className="h-screen overflow-y-auto custom-scrollbar bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">商机管道 (Pipeline)</h1>
                <p className="text-slate-500 mt-1 font-medium">欢迎回来，今日有 {actionCenterData.tasks.length} 项待办任务需要跟进。</p>
            </div>
            <Button 
                onClick={() => setIsModalOpen(true)} 
                icon={Plus}
                size="lg"
                className="shadow-xl shadow-indigo-100"
            >
                新建商机
            </Button>
        </div>

        {/* Action Center (Risks & Daily Tasks) */}
        <ActionCenter 
            tasks={actionCenterData.tasks} 
            risks={actionCenterData.risks}
            onSelectCustomer={onSelectCustomer}
            getStatusColor={getStatusColor}
        />

        {/* Search & Filter Toolbar */}
        <DashboardToolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
        />

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                    <CustomerCard 
                        key={customer.id} 
                        customer={customer} 
                        onClick={() => onSelectCustomer(customer.id)}
                        getStatusColor={getStatusColor}
                    />
                ))
            ) : (
                <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-lg font-medium">未找到匹配的商机</p>
                    <p className="text-sm mt-1">尝试调整搜索词或筛选条件</p>
                </div>
            )}
        </div>

      </div>

      <NewCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={onAddCustomer} 
      />
    </div>
  );
};

export default DashboardView;