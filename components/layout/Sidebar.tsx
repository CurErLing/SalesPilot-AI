
import React from 'react';
import { ViewState } from '../../types';
import { 
  LayoutDashboard, Menu, 
  UserCircle, Calendar, Globe, BarChart3, Compass,
  LayoutGrid, ArrowLeft, Building2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onBackToPipeline: () => void;
  customerName: string;
}

// Optimized Workflow Grouping
const menuGroups = [
  {
    title: '全景概览',
    items: [
      { id: ViewState.PROJECT_COCKPIT, label: '项目驾驶舱', icon: LayoutGrid },
    ]
  },
  {
    title: '情报构建',
    items: [
      { id: ViewState.PERSONA, label: '全景画像', icon: UserCircle },
      { id: ViewState.WEB_RESEARCH, label: '网络调研', icon: Globe },
    ]
  },
  {
    title: '行动执行',
    items: [
      { id: ViewState.VISIT_RECORDS, label: '拜访记录', icon: Calendar },
    ]
  },
  {
    title: '赢单大脑',
    items: [
      { id: ViewState.ASSESSMENT, label: '价值评估', icon: BarChart3 },
      { id: ViewState.STRATEGY, label: '致胜策略', icon: Compass },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggle, 
  currentView,
  onViewChange,
  onBackToPipeline,
  customerName
}) => {
  return (
    <aside 
      className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col shrink-0 z-20 shadow-xl relative`}
    >
      {/* 1. Global Navigation (Back to Pipeline) */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 shrink-0 bg-slate-950/50">
          <button 
            onClick={onBackToPipeline}
            className={`flex items-center gap-3 w-full hover:text-white transition-colors group ${!isOpen ? 'justify-center' : ''}`}
            title="返回商机管道"
          >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-colors shrink-0">
                  {isOpen ? <ArrowLeft className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
              </div>
              {isOpen && (
                  <span className="font-bold text-sm tracking-wide">返回管道</span>
              )}
          </button>
      </div>

      {/* 2. Customer Context Card (The Anchor) */}
      <div className="p-4 border-b border-slate-800/50 bg-slate-900 relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-indigo-900/50">
                  {customerName.charAt(0)}
              </div>
              {isOpen && (
                  <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left-2">
                      <div className="font-bold text-white truncate text-sm leading-tight">{customerName}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                          <Building2 className="w-3 h-3" /> 当前客户
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* 3. Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-6">
          {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="px-3">
                  {isOpen && (
                      <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {group.title}
                      </div>
                  )}
                  {/* Divider for collapsed mode */}
                  {!isOpen && groupIdx > 0 && (
                       <div className="w-8 h-px bg-slate-800 mx-auto my-3"></div>
                  )}
                  
                  <div className="space-y-1">
                      {group.items.map(item => {
                          const isActive = currentView === item.id;
                          return (
                              <button 
                                  key={item.id}
                                  onClick={() => onViewChange(item.id)}
                                  className={`
                                      w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group relative
                                      ${isActive 
                                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' 
                                          : 'hover:bg-slate-800 hover:text-white text-slate-400'
                                      } 
                                      ${!isOpen ? 'justify-center' : ''}
                                  `}
                                  title={item.label}
                              >
                                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                                  
                                  {/* Active Indicator Line (Left) */}
                                  {isActive && !isOpen && (
                                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-r-full"></div>
                                  )}
                              </button>
                          );
                      })}
                  </div>
              </div>
          ))}
      </div>

      {/* 4. User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center' : ''}`}>
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400 shrink-0">
                JD
             </div>
             {isOpen && (
                  <div className="flex-1 min-w-0 animate-in fade-in">
                      <div className="text-xs font-bold text-slate-300">John Doe</div>
                      <div className="text-[10px] text-slate-600">在线</div>
                  </div>
             )}
             <button onClick={toggle} className="text-slate-500 hover:text-white transition-colors">
                 <Menu className="w-4 h-4" />
             </button>
        </div>
      </div>
    </aside>
  );
};
