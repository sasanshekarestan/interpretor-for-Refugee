/**
 * Helper to auto-extract key entity details (dates, times, postcodes, reference numbers, monetary amounts, phone numbers)
 * from conversation speech or text.
 */
export function extractKeyDetails(text: string): string[] {
  if (!text) return [];

  const found: string[] = [];

  // 1. Monetary Amounts (e.g., £49.18, 49.18 GBP, £100)
  const moneyMatches = text.match(/(?:£|\bGBP\s*)\d+(?:\.\d{2})?|\b\d+(?:\.\d{2})?\s*(?:pounds|GBP)/gi);
  if (moneyMatches) {
    found.push(...moneyMatches.map(m => m.trim()));
  }

  // 2. Reference numbers (e.g., NASS 12/03/4567, ARC 01234567, Ref: HO-987654)
  const refMatches = text.match(/\b(?:NASS|ARC|HO|Ref|Reference|Case|SOL)[\s:#\-\/]*[A-Z0-9\/-]{4,15}\b/gi);
  if (refMatches) {
    found.push(...refMatches.map(m => m.trim()));
  }

  // 3. Postcodes (e.g., SW1A 1AA, M1 1AA, CR0 2WB)
  const postcodeMatches = text.match(/\b[A-Z]{1,2}\d[A-Z0-9]?\s*\d[A-Z]{2}\b/gi);
  if (postcodeMatches) {
    found.push(...postcodeMatches.map(m => m.trim()));
  }

  // 4. Dates & Times (e.g., 24 August, 10:30 AM, 2:15pm, Monday 14th)
  const dateTimeMatches = text.match(/\b(?:\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?|(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))\b/gi);
  if (dateTimeMatches) {
    found.push(...dateTimeMatches.map(m => m.trim()));
  }

  // 5. UK Phone Numbers (e.g., 07123456789, +44 7123 456789)
  const phoneMatches = text.match(/\b(?:07\d{9}|\+44\s*7\d{3}\s*\d{6})\b/g);
  if (phoneMatches) {
    found.push(...phoneMatches.map(m => m.trim()));
  }

  // Deduplicate case-insensitively
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const item of found) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique;
}
