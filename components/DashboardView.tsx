
import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { Button } from './ui/Button';
import { Plus, Search } from 'lucide-react';

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
      const risks: Array<{ customer: Customer; daysInactive: number }> = [];
      const tasks: Array<{ type: 'meeting' | 'todo'; date: string; content: string; customer: Customer }> = [];

      customers.forEach(c => {
          // 1. Identify Risks (Active deals with > 7 days inactivity)
          if (c.status !== '赢单' && c.status !== '输单') {
              const last = new Date(c.lastContact).getTime();
              const diff = Math.floor((today.getTime() - last) / (1000 * 3600 * 24));
              if (diff > 7) {
                  risks.push({ customer: c, daysInactive: diff });
              }
          }

          // 2. Identify Tasks (Planned Meetings OR Next Steps from latest visit)
          // Sort visits to get latest
          const sortedVisits = [...c.visits].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Check for upcoming planned meetings
          const plannedVisit = sortedVisits.find(v => v.status === 'Planned');
          
          if (plannedVisit) {
              tasks.push({
                  type: 'meeting',
                  date: plannedVisit.date,
                  content: plannedVisit.title || '预定拜访/会议',
                  customer: c
              });
          } else if (sortedVisits.length > 0) {
              // If no planned meeting, show next step from latest completed visit if exists
              const latestCompleted = sortedVisits.find(v => v.status !== 'Planned');
              if (latestCompleted && latestCompleted.nextSteps) {
                  tasks.push({
                      type: 'todo',
                      date: latestCompleted.date, // context date
                      content: latestCompleted.nextSteps,
                      customer: c
                  });
              }
          }
      });

      // Sort risks by inactivity desc
      risks.sort((a, b) => b.daysInactive - a.daysInactive);
      // Sort tasks (meetings first, then by date)
      tasks.sort((a, b) => {
          if (a.type === 'meeting' && b.type !== 'meeting') return -1;
          if (a.type !== 'meeting' && b.type === 'meeting') return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      return { risks, tasks };
  }, [customers]);


  // --- Filtering Logic ---
  const filteredCustomers = useMemo(() => {
    let result = customers;

    // 1. Status Filter
    if (statusFilter !== 'ALL') {
        result = result.filter(c => c.status === statusFilter);
    }

    // 2. Search Filter (Deep Search)
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(c => {
            // Basic Fields
            if (c.name.toLowerCase().includes(q) || c.projectName?.toLowerCase().includes(q)) return true;
            if (c.persona.industry?.toLowerCase().includes(q)) return true;
            
            // Deep Search: Decision Makers
            if (c.persona.decisionMakers?.some(dm => dm.name.toLowerCase().includes(q))) return true;

            // Deep Search: Visits (Title, Content)
            if (c.visits?.some(v => v.title.toLowerCase().includes(q) || v.content?.toLowerCase().includes(q))) return true;

            return false;
        });
    }

    // 3. Sorting
    return result.sort((a, b) => {
        if (sortBy === 'score') {
            return (b.assessmentScore || 0) - (a.assessmentScore || 0);
        }
        if (sortBy === 'budget') {
             // Simple parsing of budget string to number for sorting
             const getVal = (s?: string) => parseFloat(s?.replace(/[^0-9]/g, '') || '0');
             return getVal(b.persona.budget) - getVal(a.persona.budget);
        }
        // Default: Recent (Last Contact or UpdatedAt)
        return new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime();
    });
  }, [customers, searchQuery, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    if (status === '合格') return 'bg-purple-100 text-purple-700';
    if (status === '线索') return 'bg-blue-100 text-blue-700';
    if (status === '谈判') return 'bg-amber-100 text-amber-700';
    if (status === '赢单') return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">商机管道</h1>
            <p className="text-slate-500 text-lg">管理您的销售机会，从线索到赢单的全流程。</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            icon={Plus} 
            size="lg"
            className="shadow-xl shadow-indigo-200"
          >
            新建商机
          </Button>
        </div>

        {/* Action Center */}
        <ActionCenter 
            tasks={actionCenterData.tasks} 
            risks={actionCenterData.risks} 
            onSelectCustomer={onSelectCustomer} 
            getStatusColor={getStatusColor}
        />

        {/* Toolbar */}
        <DashboardToolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
        />

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((c) => (
                <CustomerCard 
                    key={c.id} 
                    customer={c} 
                    onClick={() => onSelectCustomer(c.id)} 
                    getStatusColor={getStatusColor}
                />
            ))
          ) : (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                 <Search className="w-12 h-12 mb-4 opacity-20" />
                 <p className="text-lg font-medium">未找到匹配的商机</p>
                 <p className="text-sm">尝试调整搜索关键词或过滤器</p>
                 <Button 
                    variant="ghost" 
                    className="mt-4"
                    onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                 >
                    清除所有筛选
                 </Button>
             </div>
          )}
          
          {/* Add New Placeholder Card (Only show when no filters are active or specifically filtering for it) */}
          {statusFilter === 'ALL' && !searchQuery && (
            <div 
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all cursor-pointer min-h-[320px]"
            >
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                </div>
                <span className="font-semibold">创建新商机</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <NewCustomerModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={onAddCustomer} 
      />
    </div>
  );
};

export default DashboardView;
