
import { PersonaData, PainPoint, Stakeholder, FieldMetadata } from '../types';

export const mergePersonaWithMetadata = (
    current: PersonaData, 
    updates: Partial<PersonaData>, 
    sourceName: string,
    manuallyVerified: boolean = false // 新增参数：默认 AI 提取为未确认
): PersonaData => {
    const next = { ...current };
    const nextMetadata = { ...(current._metadata || {}) };
    const now = Date.now();

    const simpleFields: (keyof PersonaData)[] = [
        'industry', 'companySize', 'scenario', 
        'projectBackground', 'budget', 'projectTimeline', 
        'currentSolution', 'customerExpectations'
    ];

    simpleFields.forEach(field => {
        const newValue = updates[field];
        if (newValue && newValue !== current[field]) {
            // 如果是 AI 自动提取且该字段已存在人工确认的值，则记录为建议，这里简化为更新元数据
            (next[field] as any) = newValue;
            nextMetadata[field] = {
                source: sourceName,
                timestamp: now,
                isVerified: manuallyVerified, // AI 提取的字段为 false
                previousValue: current[field] as string
            };
        }
    });

    if (updates.keyPainPoints && updates.keyPainPoints.length > 0) {
        const newItems = (updates.keyPainPoints as any[]).map(p => typeof p === 'string' ? p : p.description);
        const existingDescriptions = new Set((current.keyPainPoints || []).map(p => p.description));
        
        const validNewPoints: PainPoint[] = newItems
            .filter(desc => desc && !existingDescriptions.has(desc))
            .map(desc => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                description: desc,
                createdAt: new Date().toISOString().split('T')[0],
                source: sourceName,
                isSolved: false
            }));
            
        if (validNewPoints.length > 0) {
            next.keyPainPoints = [...(current.keyPainPoints || []), ...validNewPoints];
        }
    }

    if (updates.decisionMakers && updates.decisionMakers.length > 0) {
        const existingNames = new Set((current.decisionMakers || []).map(dm => dm.name));
        const newDMs = updates.decisionMakers.filter(dm => !existingNames.has(dm.name));
        
        if (newDMs.length > 0) {
            const finalizedDMs = newDMs.map(dm => ({
                ...dm,
                id: dm.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
                role: dm.role || 'Unknown',
                stance: dm.stance || 'Neutral'
            }));
            next.decisionMakers = [...(current.decisionMakers || []), ...finalizedDMs as Stakeholder[]];
        }
    }

    if (updates.competitors && updates.competitors.length > 0) {
        const uniqueCompetitors = new Set([...(current.competitors || []), ...updates.competitors]);
        next.competitors = Array.from(uniqueCompetitors);
    }

    next._metadata = nextMetadata;
    return next;
};
