
import React from 'react';
import { Stakeholder } from '../../types';
import { Avatar } from '../ui/Avatar';

interface Props {
    stakeholders: Stakeholder[];
    onView: (s: Stakeholder) => void;
}

// Recursive Tree Node Component
const TreeNode: React.FC<{ 
    node: Stakeholder; 
    children: Stakeholder[]; 
    allStakeholders: Stakeholder[];
    onView: (s: Stakeholder) => void;
}> = ({ node, children, allStakeholders, onView }) => {
    
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Economic Buyer': return 'border-purple-200 bg-purple-50 text-purple-700';
            case 'Technical Buyer': return 'border-blue-200 bg-blue-50 text-blue-700';
            case 'User Buyer': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'Coach': return 'border-amber-200 bg-amber-50 text-amber-700';
            default: return 'border-slate-200 bg-white text-slate-600';
        }
    };

    const getRoleInitial = (role: string) => {
        if (role === 'Economic Buyer') return 'EB';
        if (role === 'Technical Buyer') return 'TB';
        if (role === 'User Buyer') return 'UB';
        return role.charAt(0);
    };

    return (
        <div className="flex flex-col items-center">
            {/* The Node Card */}
            <div 
                onClick={() => onView(node)}
                className={`
                    relative z-10 w-48 p-3 rounded-xl border-2 shadow-sm transition-all cursor-pointer hover:scale-105 hover:shadow-md bg-white
                    ${getRoleColor(node.role)}
                `}
            >
                <div className="flex items-center gap-3">
                    <Avatar name={node.name} size="sm" className="bg-white/80 border-0 shadow-none shrink-0" />
                    <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{node.name}</div>
                        <div className="text-[10px] opacity-80 truncate">{node.title}</div>
                    </div>
                </div>
                {/* Role Badge (Absolute Top Right) */}
                <div className="absolute -top-2 -right-2 bg-white border border-slate-100 shadow-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500">
                    {getRoleInitial(node.role)}
                </div>
                {/* Stance Indicator (Bottom Right) */}
                {node.stance && (
                    <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full ring-2 ring-white
                        ${node.stance === 'Champion' ? 'bg-emerald-500' : 
                          node.stance === 'Positive' ? 'bg-green-400' :
                          node.stance === 'Negative' ? 'bg-red-400' :
                          node.stance === 'Blocker' ? 'bg-red-700' : 'bg-slate-300'
                        }
                    `} title={`Stance: ${node.stance}`} />
                )}
            </div>

            {/* Children Connector Lines */}
            {children.length > 0 && (
                <div className="flex flex-col items-center">
                    {/* Vertical line down from parent */}
                    <div className="w-px h-6 bg-slate-300"></div>
                    
                    {/* Horizontal bar containing children */}
                    <div className="flex gap-8 relative">
                         {/* Horizontal connector line (only if > 1 child) */}
                         {children.length > 1 && (
                             <div className="absolute top-0 left-0 right-0 h-px bg-slate-300 mx-[calc(50%/var(--child-count))]"></div>
                         )}

                         {children.map((child, idx) => {
                             // Find grandchildren
                             const grandChildren = allStakeholders.filter(s => s.reportsTo === child.id);
                             
                             return (
                                 <div key={child.id} className="flex flex-col items-center relative">
                                     {/* Connector styling tricks for pure CSS trees are complex, 
                                         using simple flex gap layout with top-border specific logic 
                                         usually requires specific widths. 
                                         Instead, we use a simpler visual approach: 
                                         Just lines down from parent, and simple spacing for children.
                                     */}
                                     
                                     {/* Vertical line up from child to common bar */}
                                     {/* Using pseudo elements or hard divs. Let's use hard divs for clarity */}
                                     <div className="w-full flex justify-center h-4 relative">
                                         {/* The vertical connector */}
                                          <div className={`w-px h-full bg-slate-300 ${children.length > 1 ? '' : 'hidden'}`}></div>
                                          
                                          {/* The horizontal connectors logic for first/last child needs absolute positioning or specific CSS.
                                              Simpler approach: A horizontal bar spanning all children, with vertical drops.
                                          */}
                                     </div>
                                     
                                     {/* For perfect lines: 
                                         We need a bar that spans from the center of the first child to the center of the last child.
                                         This is hard in pure flex without fixed widths.
                                         Fallback: Just show vertical lines for now or use a library. 
                                         
                                         Better Visual Hack: 
                                         Use a wrapper "Bridge" component.
                                     */}
                                     
                                     <div className="relative">
                                         {/* Top horizontal connector hacks */}
                                         {children.length > 1 && (
                                            <>
                                                {/* Left half connector (if not first) */}
                                                {idx > 0 && <div className="absolute top-[-16px] left-[-50%] w-[50%] h-px bg-slate-300"></div>} 
                                                {/* Right half connector (if not last) */}
                                                {idx < children.length - 1 && <div className="absolute top-[-16px] right-[-50%] w-[50%] h-px bg-slate-300"></div>}
                                                {/* Vertical connector down to node */}
                                                {/* <div className="absolute top-[-16px] left-1/2 w-px h-4 bg-slate-300 -translate-x-1/2"></div> */}
                                            </>
                                         )}
                                          
                                         <TreeNode 
                                            node={child} 
                                            children={grandChildren} 
                                            allStakeholders={allStakeholders}
                                            onView={onView}
                                         />
                                     </div>
                                 </div>
                             );
                         })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const StakeholderOrgChart: React.FC<Props> = ({ stakeholders, onView }) => {
    // 1. Identify Root Nodes (Those who have no reportsTo OR reportsTo ID doesn't exist in list)
    const rootNodes = stakeholders.filter(s => 
        !s.reportsTo || !stakeholders.find(parent => parent.id === s.reportsTo)
    );

    const getChildren = (parentId: string) => {
        return stakeholders.filter(s => s.reportsTo === parentId);
    };

    if (stakeholders.length === 0) {
        return <div className="text-center text-slate-400 py-10">暂无数据</div>;
    }

    return (
        <div className="w-full overflow-x-auto p-8 custom-scrollbar bg-slate-50 rounded-xl border border-slate-200 min-h-[400px] flex justify-center">
            <div className="flex gap-16">
                {rootNodes.map(root => (
                    <TreeNode 
                        key={root.id} 
                        node={root} 
                        children={getChildren(root.id)} 
                        allStakeholders={stakeholders}
                        onView={onView}
                    />
                ))}
            </div>
        </div>
    );
};
