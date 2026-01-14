
import { PersonaData, PainPoint, Stakeholder } from '../types';

/**
 * Merges new AI-extracted data into the existing persona, keeping track of data sources.
 * Handles both simple fields and complex arrays (deduplication).
 * 
 * @param current The current persona object
 * @param updates The partial updates from AI
 * @param sourceName The name of the source (e.g., "Web Research", "Visit: 2023-10-01")
 * @returns A new PersonaData object with updated fields and metadata
 */
export const mergePersonaWithMetadata = (
    current: PersonaData, 
    updates: Partial<PersonaData>, 
    sourceName: string
): PersonaData => {
    const next = { ...current };
    const nextMetadata = { ...(current._metadata || {}) };
    const now = Date.now();

    // 1. Simple Fields Merging
    const simpleFields: (keyof PersonaData)[] = [
        'industry', 'companySize', 'scenario', 
        'projectBackground', 'budget', 'projectTimeline', 
        'currentSolution', 'customerExpectations'
    ];

    simpleFields.forEach(field => {
        const newValue = updates[field];
        // Only update if value exists and is different
        if (newValue && newValue !== current[field]) {
            (next[field] as any) = newValue;
            nextMetadata[field] = {
                source: sourceName,
                timestamp: now
            };
        }
    });

    // 2. Key Pain Points (Append unique)
    if (updates.keyPainPoints && updates.keyPainPoints.length > 0) {
        // Normalize: AI might return strings or partial objects
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

    // 3. Decision Makers (Append unique by name)
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

    // 4. Competitors (Merge & Dedupe)
    if (updates.competitors && updates.competitors.length > 0) {
        const uniqueCompetitors = new Set([...(current.competitors || []), ...updates.competitors]);
        next.competitors = Array.from(uniqueCompetitors);
    }

    next._metadata = nextMetadata;
    return next;
};
