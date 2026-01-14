
import React, { useState } from 'react';
import { Building2, Sparkles, Loader2, Map } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { enrichFirmographics } from '../../services/geminiService';

interface Props {
    industry: string;
    companySize: string;
    scenario?: string; 
    onChange: (field: 'industry' | 'companySize' | 'scenario', value: string) => void;
    companyName?: string; 
}

export const FirmographicsCard: React.FC<Props> = ({ industry, companySize, scenario, onChange, companyName }) => {
    const [loading, setLoading] = useState(false);

    const handleAutoFill = async () => {
        if (!companyName) return;
        setLoading(true);
        try {
            const result = await enrichFirmographics(companyName);
            if (result.industry) onChange('industry', result.industry);
            if (result.companySize) onChange('companySize', result.companySize);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 relative overflow-hidden">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle icon={Building2}><span className="text-base">客户域</span></CardTitle>
                    <CardDescription>行业背景、企业规模与业务场景。</CardDescription>
                </div>
                {companyName && (
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                        icon={loading ? Loader2 : Sparkles}
                        onClick={handleAutoFill}
                        isLoading={loading}
                        disabled={loading}
                    >
                        AI 自动完善
                    </Button>
                )}
            </div>

            <div className="space-y-4 mt-6">
                <Input 
                    label="所属行业"
                    value={industry}
                    onChange={(e) => onChange('industry', e.target.value)}
                    placeholder="-- 未填写 --"
                    className="bg-slate-50 focus:bg-white"
                />
                
                <Input 
                    label="公司规模"
                    value={companySize}
                    onChange={(e) => onChange('companySize', e.target.value)}
                    placeholder="-- 未填写 --"
                    className="bg-slate-50 focus:bg-white"
                />

                <Input 
                    label="业务场景 (Scenario)"
                    value={scenario || ''}
                    onChange={(e) => onChange('scenario', e.target.value)}
                    placeholder="例如：门店数字化升级 / 供应链协同"
                    className="bg-indigo-50 border-indigo-200 focus:bg-white placeholder:text-indigo-300"
                />
            </div>
        </Card>
    );
};
