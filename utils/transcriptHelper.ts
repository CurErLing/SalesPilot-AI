
export interface ParsedSegment {
    time: string; // "MM:SS" or "00:00" if missing
    speaker: string;
    text: string;
}

/**
 * Parses raw transcript text into structured segments.
 * Supports formats:
 * 1. "[00:00] Speaker: Text" (Standard AI output)
 * 2. "Speaker: Text" (Legacy/Manual input)
 */
export const parseTranscript = (text: string): ParsedSegment[] => {
    if (!text) return [];
    
    const lines = text.split('\n');
    const segments: ParsedSegment[] = [];
    
    // Regex for standard format: [MM:SS] Name: Content
    const timestampRegex = /\[(\d{2}:\d{2})\]\s*(.*?):\s*(.*)/;
    
    // Regex for legacy format: Name: Content (at start of line)
    const legacyRegex = /^(.*?)[：:]\s*(.*)/;

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // 1. Try Timestamp format first
        const tsMatch = trimmedLine.match(timestampRegex);
        if (tsMatch) {
            segments.push({
                time: tsMatch[1],
                speaker: tsMatch[2],
                text: tsMatch[3]
            });
            return;
        }
        
        // 2. Try Legacy format
        // We only match if it doesn't look like a timestamped line failed (e.g. starts with [)
        const legacyMatch = trimmedLine.match(legacyRegex);
        if (legacyMatch && !trimmedLine.startsWith('[')) {
             segments.push({
                time: '00:00', // Default time
                speaker: legacyMatch[1],
                text: legacyMatch[2]
            });
            return;
        }
        
        // 3. Fallback: Continuation of previous text or raw text
        if (segments.length > 0) {
            segments[segments.length - 1].text += ` ${trimmedLine}`;
        } else {
             // If it's the very first line and matches nothing, treat as Unknown speaker
             segments.push({
                time: '00:00',
                speaker: 'Unknown',
                text: trimmedLine
            });
        }
    });
    
    return segments;
};

/**
 * Serializes segments back to string format
 */
export const stringifyTranscript = (segments: ParsedSegment[]): string => {
    return segments.map(s => `[${s.time}] ${s.speaker}: ${s.text}`).join('\n');
};
