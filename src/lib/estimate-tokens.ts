/** Rough token estimate for LLM prompts (~±10–20% vs real tokenizers). */
export function estimateTokens(text: string): number {
	if (!text) return 0;

	const chars = text.length;
	const words = text.trim() ? text.trim().split(/\s+/).length : 0;

	const byChars = chars / 4;
	const byWords = words * 1.3;

	return Math.round((byChars + byWords) / 2);
}
