import type { SymptomResponse } from './types';

// format baku tabel symptoms: hanya G01 sampai G39 (T5)
const SYMPTOM_CODE_PATTERN = /^G(0[1-9]|[12]\d|3[0-9])$/;

export function isValidSymptomCode(code: string): boolean {
  return SYMPTOM_CODE_PATTERN.test(code);
}

export function normalizeSymptomCode(code: string): string {
  const match = code.match(/G0*(\d+)/);
  return match ? `G${match[1]}` : code;
}

// cocokkan lewat normalisasi, karena symptoms memakai G01 sedangkan expert_system memakai G1
export function isSymptomReferenced(kodeGejala: string, expertEntries: { kodeGejala: string }[]): boolean {
  const target = normalizeSymptomCode(kodeGejala);
  return expertEntries.some(e => normalizeSymptomCode(e.kodeGejala) === target);
}

export function encodeResponses(responses: SymptomResponse[]): string {
  const nonZeroResponses = responses.filter(r => r.userCF > 0);
  return nonZeroResponses
    .map(r => `${normalizeSymptomCode(r.symptomCode)}:${r.userCF}`)
    .join(',');
}
