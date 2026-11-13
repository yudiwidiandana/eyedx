import { getSymptoms, getIllnesses, getExpertSystem } from './db';
import type { DiagnosisResult, SymptomResponse } from './types';
import { normalizeSymptomCode } from './symptomUtils';

const NEGATIVE_EVIDENCE_WEIGHT = 0.5;

function combineCF(cfOld: number, cfNew: number): number {
  return cfOld + cfNew * (1 - cfOld);
}

function calculateSymptomCF(expertCF: number, userCF: number): number {
  return expertCF * userCF;
}

export async function getSymptomName(code: string): Promise<string> {
  const symptoms = await getSymptoms();
  const symptom = symptoms.find(
    s => s.kodeGejala === code || normalizeSymptomCode(s.kodeGejala) === normalizeSymptomCode(code)
  );
  return symptom?.namaGejala || code;
}

export async function getIllnessName(code: string): Promise<string> {
  const illnesses = await getIllnesses();
  const illness = illnesses.find(i => i.kodePenyakit === code);
  return illness?.namaPenyakit || code;
}

export async function calculateDiagnosis(responses: SymptomResponse[]): Promise<DiagnosisResult[]> {
  const diseases = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
  const results: DiagnosisResult[] = [];

  const expertSymptoms = await getExpertSystem();
  const illnesses = await getIllnesses();

  for (const diseaseCode of diseases) {
    let positiveCF = 0;
    let hasProcessedPositive = false;
    let negativePenalty = 1.0;
    const contributingSymptoms: string[] = [];

    responses.forEach(response => {
      if (response.userCF === 0) return;

      const normalizedCode = normalizeSymptomCode(response.symptomCode);
      const expertSymptom = expertSymptoms.find(
        es => normalizeSymptomCode(es.kodeGejala) === normalizedCode
      );

      if (!expertSymptom) return;

      const expertCF = expertSymptom.cf[diseaseCode as keyof typeof expertSymptom.cf];

      if (expertCF === null || expertCF === 0) {
        negativePenalty *= (1 - response.userCF * NEGATIVE_EVIDENCE_WEIGHT);
      } else {
        const symptomCF = calculateSymptomCF(expertCF, response.userCF);

        if (!hasProcessedPositive) {
          positiveCF = symptomCF;
          hasProcessedPositive = true;
        } else {
          positiveCF = combineCF(positiveCF, symptomCF);
        }

        contributingSymptoms.push(response.symptomName);
      }
    });

    const finalCF = positiveCF * negativePenalty;
    const illness = illnesses.find(i => i.kodePenyakit === diseaseCode);

    results.push({
      diseaseCode,
      diseaseName: illness?.namaPenyakit || diseaseCode,
      cfValue: finalCF,
      percentage: Math.round(finalCF * 100),
      contributingSymptoms,
    });
  }

  return results.sort((a, b) => b.cfValue - a.cfValue);
}

export { encodeResponses } from './symptomUtils';

// pakai snapshot yang disimpan saat hasil dibuat (T3) supaya tidak berubah kalau
// pakar mengedit CF di panel admin belakangan; rekaman lama tanpa snapshot (null)
// jatuh ke hitung ulang seperti perilaku sebelumnya
export async function resolveDiagnosisResults(record: {
  responses: string;
  resultsSnapshot?: string | null;
}): Promise<{ responses: SymptomResponse[]; results: DiagnosisResult[] }> {
  if (record.resultsSnapshot) {
    try {
      const parsed = JSON.parse(record.resultsSnapshot);
      if (Array.isArray(parsed?.responses) && Array.isArray(parsed?.results)) {
        return { responses: parsed.responses, results: parsed.results };
      }
    } catch {
      // snapshot rusak/tak terbaca, jatuh ke hitung ulang di bawah
    }
  }

  const responses = await decodeResponses(record.responses);
  const results = await calculateDiagnosis(responses);
  return { responses, results };
}

export async function decodeResponses(encoded: string): Promise<SymptomResponse[]> {
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