
import React from 'react';
import { ViewState } from '../../types';
import { 
  LayoutDashboard, Menu, 
  UserCircle, Calendar, Globe, BarChart3, Compass,
  Target, Zap, Trophy, LayoutGrid
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onBackToPipeline: () => void;
  customerName: string;
}

// Grouped Menu Structure reflecting Sales Workflow
// Removed English subtitles
const menuGroups = [
  {
    title: '洞察与情报',
    icon: Target, 
    items: [
      { id: ViewState.PERSONA, label: '全景画像', icon: UserCircle },
      { id: ViewState.WEB_RESEARCH, label: '网络调研', icon: Globe },
    ]
  },
  {
    title: '互动与跟进',
    icon: Zap,
    items: [
      { id: ViewState.VISIT_RECORDS, label: '拜访记录', icon: Calendar },
    ]
  },
  {
    title: '策略与赢单',
    icon: Trophy,
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
      className={`${isOpen ? 'w-64' : 'w-20'} bg-white text-slate-600 transition-all duration-500 ease-in-out flex flex-col border-r border-slate-200/60 shrink-0 z-20 shadow-xl shadow-slate-200/50 relative overflow-hidden`}
    >
      {/* Decorative Top Gradient Blur for a younger feel */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>

      {/* Brand Header (Clickable to go Home) */}
      <div className="p-5 flex items-center justify-between h-20 shrink-0 relative z-10">
        <button 
            onClick={onBackToPipeline}
            className={`flex items-center gap-3 transition-all hover:opacity-80 focus:outline-none group ${!isOpen ? 'w-full justify-center' : ''}`}
            title="返回商机管道 (Dashboard)"
        >
            <div className="w-9 h-9 rounded-xl bg-gradient-ai flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0 group-hover:scale-105 transition-transform duration-300">
                <LayoutDashboard className="w-5 h-5" />
            </div>
            {isOpen && (
                <div className="flex flex-col items-start animate-in fade-in duration-300">
                    <span className="font-extrabold text-slate-800 text-lg tracking-tight leading-none font-sans">SalesPilot</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 group-hover:text-indigo-500 transition-colors">点击返回管道</span>
                </div>
            )}
        </button>
      </div>

      {/* Navigation Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2 space-y-8 relative z-10">
          
          {/* Customer Context (Mini Card) */}
          {isOpen && (
            <div className="px-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1 pl-1">
                    当前作战单元
                </div>
                <button 
                    onClick={() => onViewChange(ViewState.PROJECT_COCKPIT)}
                    className={`w-full text-left font-bold leading-snug truncate text-sm pl-4 border-l-2 py-3 transition-all rounded-r-xl group shadow-sm
                        ${currentView === ViewState.PROJECT_COCKPIT 
                            ? 'border-indigo-500 text-indigo-700 bg-indigo-50/60' 
                            : 'border-slate-200 text-slate-600 bg-white hover:border-indigo-300 hover:text-indigo-600 hover:bg-slate-50'
                        }
                    `}
                >
                    <div className="flex items-center justify-between pr-3">
                        <span className="truncate">{customerName}</span>
                        <LayoutGrid className={`w-3.5 h-3.5 transition-all ${currentView === ViewState.PROJECT_COCKPIT ? 'text-indigo-500 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                    </div>
                    <span className={`text-[10px] font-normal block mt-0.5 ${currentView === ViewState.PROJECT_COCKPIT ? 'text-indigo-400' : 'text-slate-400'}`}>点击进入驾驶舱</span>
                </button>
            </div>
          )}
          
          {/* Grouped Menu Items */}
          <div className="space-y-6 px-3">
              {menuGroups.map((group, groupIdx) => (
                  <div key={groupIdx}>
                      {isOpen && (
                          <div className="px-3 mb-2 flex items-center gap-2">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">{group.title}</span>
                          </div>
                      )}
                      {!isOpen && (
                           <div className="w-4 h-0.5 bg-slate-100 my-4 mx-auto rounded-full"></div>
                      )}
                      
                      <div className="space-y-1">
                          {group.items.map(item => (
                              <button 
                                  key={item.id}
                                  onClick={() => onViewChange(item.id)}
                                  className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 relative overflow-hidden group ${
                                      currentView === item.id 
                                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200 font-semibold' 
                                      : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                                  } ${!isOpen ? 'justify-center' : ''}`}
                                  title={item.label}
                              >
                                  <item.icon className={`w-4 h-4 flex-shrink-0 relative z-10 transition-colors ${currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                                  {isOpen && <span className="text-sm relative z-10">{item.label}</span>}
                              </button>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 bg-white relative z-10">
        <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center' : ''}`}>
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold shrink-0 shadow-md ring-2 ring-white">
                JD
             </div>
             {isOpen && (
                  <div className="flex-1 min-w-0 animate-in fade-in">
                      <div className="text-sm font-bold text-slate-800 truncate">John Doe</div>
                      <div className="text-xs text-slate-400 truncate font-medium">高级客户经理</div>
                  </div>
             )}
             {isOpen && (
                 <button onClick={toggle} className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-50 rounded-lg">
                     <Menu className="w-4 h-4" />
                 </button>
             )}
        </div>
        {!isOpen && (
            <button onClick={toggle} className="w-full flex justify-center mt-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-colors">
                <Menu className="w-4 h-4" />
            </button>
        )}
      </div>
    </aside>
  );
};
