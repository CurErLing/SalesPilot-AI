
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface Props {
    competitors: string[];
}

export const CompetitorSnapshotCard: React.FC<Props> = ({ competitors }) => {
    if (!competitors || competitors.length === 0) return null;

    return (
        <Card className="p-5 bg-red-50/50 border-red-100/50">
             <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> 竞争威胁
             </h3>
             <div className="flex flex-wrap gap-2">
                 {competitors.map((comp, i) => (
                     <Badge key={i} className="bg-white text-red-600 border-red-100">{comp}</Badge>
                 ))}
             </div>
        </Card>
    );
};
