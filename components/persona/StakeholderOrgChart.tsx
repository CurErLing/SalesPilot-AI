
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stakeholder, Relationship } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Zap, XCircle, MousePointer2 } from 'lucide-react';
import { getRoleColor } from '../../utils/formatters';

interface Props {
    stakeholders: Stakeholder[];
    relationships: Relationship[];
    onView: (s: Stakeholder) => void;
    onUpdateStakeholder?: (s: Stakeholder) => void;
    onUpdateRelationships?: (rels: Relationship[]) => void;
}

// --- Node Component with Drag Support ---
const TreeNode: React.FC<{ 
    node: Stakeholder; 
    children: Stakeholder[]; 
    allStakeholders: Stakeholder[];
    relationships: Relationship[];
    onView: (s: Stakeholder) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDrop: (e: React.DragEvent, targetId: string) => void;
    onNodeClick: (e: React.MouseEvent, id: string) => void;
    connectingMode: boolean;
    selectedSourceId: string | null;
}> = ({ node, children, allStakeholders, relationships, onView, onDragStart, onDrop, onNodeClick, connectingMode, selectedSourceId }) => {
    
    // Using centralized color map, adapting border prefix
    const roleColorClass = getRoleColor(node.role);
    // Add border logic if not present in util or override
    const nodeColorClass = roleColorClass.replace('bg-', 'bg-').replace('border-', 'border-');

    const getRoleInitial = (role: string) => {
        if (role === 'Economic Buyer') return 'EB';
        if (role === 'Technical Buyer') return 'TB';
        if (role === 'User Buyer') return 'UB';
        return role.charAt(0);
    };

    const isSource = selectedSourceId === node.id;

    return (
        <div className="flex flex-col items-center">
            {/* The Node Card */}
            <div 
                id={`node-${node.id}`} // Important for SVG lines
                draggable={!connectingMode}
                onDragStart={(e) => onDragStart(e, node.id)}
                onDragOver={(e) => e.preventDefault()} // Allow dropping
                onDrop={(e) => onDrop(e, node.id)}
                onClick={(e) => onNodeClick(e, node.id)}
                className={`
                    relative z-10 w-48 p-3 rounded-xl border-2 shadow-sm transition-all select-none
                    ${nodeColorClass}
                    ${connectingMode ? 'cursor-crosshair hover:ring-2 hover:ring-indigo-400' : 'cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-1'}
                    ${isSource ? 'ring-4 ring-indigo-500 ring-offset-2' : ''}
                `}
            >
                <div className="flex items-center gap-3">
                    <Avatar name={node.name} size="sm" className="bg-white/80 border-0 shadow-none shrink-0" />
                    <div className="min-w-0 pointer-events-none">
                        <div className="font-bold text-sm truncate">{node.name}</div>
                        <div className="text-[10px] opacity-80 truncate">{node.title}</div>
                    </div>
                </div>
                {/* Role Badge */}
                <div className="absolute -top-2 -right-2 bg-white border border-slate-100 shadow-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500">
                    {getRoleInitial(node.role)}
                </div>
                {/* Stance Indicator */}
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

            {/* Children */}
            {children.length > 0 && (
                <div className="flex flex-col items-center">
                    <div className="w-px h-6 bg-slate-300"></div>
                    <div className="flex gap-8 relative">
                         {children.length > 1 && (
                             <div className="absolute top-0 left-0 right-0 h-px bg-slate-300 mx-[calc(50%/var(--child-count))]"></div>
                         )}
                         {children.map((child, idx) => {
                             const grandChildren = allStakeholders.filter(s => s.reportsTo === child.id);
                             return (
                                 <div key={child.id} className="flex flex-col items-center relative">
                                     <div className="w-full flex justify-center h-4 relative">
                                          <div className={`w-px h-full bg-slate-300 ${children.length > 1 ? '' : 'hidden'}`}></div>
                                     </div>
                                     <div className="relative">
                                         {children.length > 1 && (
                                            <>
                                                {idx > 0 && <div className="absolute top-[-16px] left-[-50%] w-[50%] h-px bg-slate-300"></div>} 
                                                {idx < children.length - 1 && <div className="absolute top-[-16px] right-[-50%] w-[50%] h-px bg-slate-300"></div>}
                                            </>
                                         )}
                                         <TreeNode 
                                            node={child} 
                                            children={grandChildren} 
                                            allStakeholders={allStakeholders}
                                            relationships={relationships}
                                            onView={onView}
                                            onDragStart={onDragStart}
                                            onDrop={onDrop}
                                            onNodeClick={onNodeClick}
                                            connectingMode={connectingMode}
                                            selectedSourceId={selectedSourceId}
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

export const StakeholderOrgChart: React.FC<Props> = ({ stakeholders, relationships, onView, onUpdateStakeholder, onUpdateRelationships }) => {
    const [connectingMode, setConnectingMode] = useState(false);
    const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
    const [svgLines, setSvgLines] = useState<React.ReactElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Line Calculation Logic ---
    const calculateLines = useCallback(() => {
        if (!containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const lines: React.ReactElement[] = [];

        relationships.forEach(rel => {
            const sourceEl = document.getElementById(`node-${rel.sourceId}`);
            const targetEl = document.getElementById(`node-${rel.targetId}`);

            if (sourceEl && targetEl) {
                const srcRect = sourceEl.getBoundingClientRect();
                const tgtRect = targetEl.getBoundingClientRect();

                // Calculate relative positions
                const x1 = srcRect.left - containerRect.left + srcRect.width / 2;
                const y1 = srcRect.top - containerRect.top + srcRect.height / 2;
                const x2 = tgtRect.left - containerRect.left + tgtRect.width / 2;
                const y2 = tgtRect.top - containerRect.top + tgtRect.height / 2;

                // Bezier Curve
                const controlPointOffset = 50;
                const path = `M ${x1} ${y1} C ${x1} ${y1 + controlPointOffset}, ${x2} ${y2 - controlPointOffset}, ${x2} ${y2}`;

                const color = rel.type === 'Conflict' ? '#ef4444' : '#6366f1'; // Red or Indigo
                const dash = rel.type === 'Conflict' ? '4 4' : '5 5';

                lines.push(
                    <g key={rel.id}>
                        <path 
                            d={path} 
                            stroke={color} 
                            strokeWidth="2" 
                            fill="none" 
                            strokeDasharray={dash}
                            className="animate-in fade-in duration-500"
                        />
                        {/* Direction Arrow / Icon */}
                        <circle cx={x2} cy={y2} r="3" fill={color} />
                        {/* Center Icon */}
                        <foreignObject x={(x1+x2)/2 - 10} y={(y1+y2)/2 - 10} width="20" height="20">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${rel.type === 'Conflict' ? 'bg-red-500' : 'bg-indigo-500'} shadow-sm text-[10px]`}>
                                {rel.type === 'Conflict' ? <XCircle size={12}/> : <Zap size={12}/>}
                            </div>
                        </foreignObject>
                    </g>
                );
            }
        });
        setSvgLines(lines);
    }, [relationships, stakeholders]);

    // Recalculate on render and window resize
    useEffect(() => {
        // Wait for DOM layout
        const timer = setTimeout(calculateLines, 100);
        window.addEventListener('resize', calculateLines);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateLines);
        };
    }, [calculateLines]);


    // --- Interaction Handlers ---

    // 1. Drag & Drop (Hierarchy)
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('stakeholderId', id);
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedId = e.dataTransfer.getData('stakeholderId');
        
        if (draggedId && draggedId !== targetId && onUpdateStakeholder) {
            // Check for circular dependency (simple check)
            if (draggedId === targetId) return;
            
            const draggedPerson = stakeholders.find(s => s.id === draggedId);
            if (draggedPerson) {
                // Update reporting line
                onUpdateStakeholder({ ...draggedPerson, reportsTo: targetId });
            }
        }
    };

    // 2. Click (Selection or Political Line)
    const handleNodeClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (connectingMode) {
            if (!selectedSourceId) {
                setSelectedSourceId(id);
            } else {
                if (selectedSourceId !== id && onUpdateRelationships) {
                    // Toggle relationship (if exists remove, else add Influence)
                    const existingIdx = relationships.findIndex(r => 
                        (r.sourceId === selectedSourceId && r.targetId === id) || 
                        (r.sourceId === id && r.targetId === selectedSourceId) // Check distinct direction? Assuming unidirectional influence for now
                    );

                    let newRels = [...relationships];
                    if (existingIdx >= 0) {
                        // If exists, cycle types or remove? Let's just remove for simplicity in this interaction
                        // OR: Cycle Influence -> Conflict -> Remove
                        const existing = newRels[existingIdx];
                        if (existing.type === 'Influence') {
                            newRels[existingIdx] = { ...existing, type: 'Conflict' };
                        } else {
                            newRels.splice(existingIdx, 1);
                        }
                    } else {
                        // Create new Influence
                        newRels.push({
                            id: Date.now().toString(),
                            sourceId: selectedSourceId,
                            targetId: id,
                            type: 'Influence'
                        });
                    }
                    onUpdateRelationships(newRels);
                    setSelectedSourceId(null); // Reset after action
                } else {
                    setSelectedSourceId(null); // Deselect if same clicked
                }
            }
        } else {
            // View Profile
            const s = stakeholders.find(p => p.id === id);
            if (s) onView(s);
        }
    };

    // Tree Construction
    const rootNodes = stakeholders.filter(s => 
        !s.reportsTo || !stakeholders.find(parent => parent.id === s.reportsTo)
    );
    const getChildren = (parentId: string) => stakeholders.filter(s => s.reportsTo === parentId);

    if (stakeholders.length === 0) {
        return <div className="text-center text-slate-400 py-10">暂无数据</div>;
    }

    return (
        <div className="relative flex flex-col items-center">
            {/* Toolbar */}
            <div className="sticky top-0 z-50 flex items-center gap-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-sm mb-6">
                <button 
                    onClick={() => { setConnectingMode(!connectingMode); setSelectedSourceId(null); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${connectingMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    <Zap className="w-3.5 h-3.5" />
                    {connectingMode ? '退出连线模式' : '绘制政治连线'}
                </button>
                
                {connectingMode && (
                    <span className="text-xs text-slate-500 animate-pulse">
                        {selectedSourceId ? "请点击目标决策人..." : "请点击起点决策人..."}
                    </span>
                )}
                {!connectingMode && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <MousePointer2 className="w-3 h-3" />
                        <span>拖拽头像调整汇报关系</span>
                    </div>
                )}
            </div>

            {/* Canvas Container */}
            <div ref={containerRef} className="relative w-full overflow-x-auto p-8 custom-scrollbar bg-slate-50/50 rounded-xl border border-slate-200 min-h-[500px] flex justify-center">
                
                {/* SVG Layer (Behind) */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    {svgLines}
                </svg>

                {/* Tree Nodes (Foreground) */}
                <div className="flex gap-16 relative z-10">
                    {rootNodes.map(root => (
                        <TreeNode 
                            key={root.id} 
                            node={root} 
                            children={getChildren(root.id)} 
                            allStakeholders={stakeholders}
                            relationships={relationships}
                            onView={onView}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onNodeClick={handleNodeClick}
                            connectingMode={connectingMode}
                            selectedSourceId={selectedSourceId}
                        />
                    ))}
                </div>
            </div>
            
            {/* Legend */}
            <div className="flex gap-4 mt-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-slate-300"></div>汇报实线</div>
                <div className="flex items-center gap-1"><div className="w-3 h-0.5 border-t border-dashed border-indigo-400"></div>影响力虚线</div>
                <div className="flex items-center gap-1"><div className="w-3 h-0.5 border-t border-dashed border-red-400"></div>对立/冲突</div>
            </div>
        </div>
    );
};
