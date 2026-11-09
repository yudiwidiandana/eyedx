import type { SymptomResponse } from './types';

export function normalizeSymptomCode(code: string): string {
  const match = code.match(/G0*(\d+)/);
  return match ? `G${match[1]}` : code;
}

export function encodeResponses(responses: SymptomResponse[]): string {
  const nonZeroResponses = responses.filter(r => r.userCF > 0);
  return nonZeroResponses
    .map(r => `${normalizeSymptomCode(r.symptomCode)}:${r.userCF}`)
    .join(',');
}

export async function decodeResponses(encoded: string, getSymptomName: (code: string) => Promise<string>): Promise<SymptomResponse[]> {
  if (!encoded) return [];

  const pairs = encoded.split(',');
  const results: SymptomResponse[] = [];
  
  for (const pair of pairs) {
    const [code, cf] = pair.split(':');
    results.push({
      symptomCode: code,
      symptomName: await getSymptomName(code),
      userCF: parseFloat(cf),
    });
  }
  
  return results;
}
