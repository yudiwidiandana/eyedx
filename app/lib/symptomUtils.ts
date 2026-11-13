import type { SymptomResponse } from './types';

// format baku tabel symptoms (G01..G39) — kode lain lolos dari normalizeSymptomCode()
// tapi diam-diam tidak pernah cocok dengan expertSystem.json saat dihitung (T5)
const SYMPTOM_CODE_PATTERN = /^G\d{2}$/;

export function isValidSymptomCode(code: string): boolean {
  return SYMPTOM_CODE_PATTERN.test(code);
}

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
