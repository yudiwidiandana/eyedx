import symptomsData from '../table/symptoms.json';
import illnessesData from '../table/illnesses.json';
import expertSystemData from '../table/expertSystem.json';
import type { Symptom, Illness, ExpertSystemSymptom, DiagnosisResult, SymptomResponse } from './types';

// Negative evidence weight: How much null/0 CF symptoms reduce confidence
// 0.3 = 50% reduction per symptom at full severity (userCF = 1.0)
const NEGATIVE_EVIDENCE_WEIGHT = 0.3;

// Normalize symptom codes (G01 -> G1, G02 -> G2, etc.)
export function normalizeSymptomCode(code: string): string {
  const match = code.match(/G0*(\d+)/);
  return match ? `G${match[1]}` : code;
}

// Combine two CF values using the certainty factor combination formula
function combineCF(cfOld: number, cfNew: number): number {
  return cfOld + cfNew * (1 - cfOld);
}

// Calculate CF for a single symptom-disease pair
function calculateSymptomCF(expertCF: number, userCF: number): number {
  return expertCF * userCF;
}

// Get symptom name by code
export function getSymptomName(code: string): string {
  const symptom = (symptomsData.symptoms as Symptom[]).find(
    s => s.kodeGejala === code || normalizeSymptomCode(s.kodeGejala) === normalizeSymptomCode(code)
  );
  return symptom?.namaGejala || code;
}

// Get illness name by code
export function getIllnessName(code: string): string {
  const illness = (illnessesData.illnesses as Illness[]).find(i => i.kodePenyakit === code);
  return illness?.namaPenyakit || code;
}

// Calculate diagnosis results based on user responses
// Treats null expert CF as 0 AND applies negative evidence penalty
export function calculateDiagnosis(responses: SymptomResponse[]): DiagnosisResult[] {
  const diseases = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
  const results: DiagnosisResult[] = [];

  // Get expert system data
  const expertSymptoms = expertSystemData.symptoms as ExpertSystemSymptom[];

  // For each disease, calculate combined CF with negative evidence penalty
  diseases.forEach(diseaseCode => {
    let positiveCF = 0;
    let hasProcessedPositive = false;
    let negativePenalty = 1.0;  // Starts at 100%, reduced by negative evidence
    const contributingSymptoms: string[] = [];

    // Process each user response
    responses.forEach(response => {
      // Skip if user didn't report this symptom
      if (response.userCF === 0) return;

      // Find expert CF for this symptom-disease pair
      const normalizedCode = normalizeSymptomCode(response.symptomCode);
      const expertSymptom = expertSymptoms.find(
        es => normalizeSymptomCode(es.kodeGejala) === normalizedCode
      );

      if (!expertSymptom) return;

      // Get expert CF for this disease
      const expertCF = expertSymptom.cf[diseaseCode as keyof typeof expertSymptom.cf];

      // Check if this is negative evidence (null or 0)
      if (expertCF === null || expertCF === 0) {
        // NEGATIVE EVIDENCE: User reports symptom NOT associated with this disease
        // Apply penalty: reduce confidence based on user severity and negative weight
        negativePenalty *= (1 - response.userCF * NEGATIVE_EVIDENCE_WEIGHT);
      } else {
        // POSITIVE EVIDENCE: Symptom matches this disease
        const symptomCF = calculateSymptomCF(expertCF, response.userCF);

        // Combine with previous CF
        if (!hasProcessedPositive) {
          // First positive symptom: initialize
          positiveCF = symptomCF;
          hasProcessedPositive = true;
        } else {
          // Subsequent positive symptoms: combine using CF formula
          positiveCF = combineCF(positiveCF, symptomCF);
        }

        // Add to contributing symptoms (only positive evidence)
        contributingSymptoms.push(response.symptomName);
      }
    });

    // Apply negative evidence penalty to positive CF
    const finalCF = positiveCF * negativePenalty;

    // Create result for this disease
    results.push({
      diseaseCode,
      diseaseName: getIllnessName(diseaseCode),
      cfValue: finalCF,
      percentage: Math.round(finalCF * 100),
      contributingSymptoms,
    });
  });

  // Sort by CF value (highest first)
  return results.sort((a, b) => b.cfValue - a.cfValue);
}

// Get all symptoms for the questionnaire
export function getAllSymptoms(): Symptom[] {
  return symptomsData.symptoms as Symptom[];
}

// Encode symptom responses to URL-safe string
export function encodeResponses(responses: SymptomResponse[]): string {
  // Only encode non-zero responses
  const nonZeroResponses = responses.filter(r => r.userCF > 0);
  return nonZeroResponses
    .map(r => `${normalizeSymptomCode(r.symptomCode)}:${r.userCF}`)
    .join(',');
}

// Decode symptom responses from URL string
export function decodeResponses(encoded: string): SymptomResponse[] {
  if (!encoded) return [];

  return encoded.split(',').map(pair => {
    const [code, cf] = pair.split(':');
    return {
      symptomCode: code,
      symptomName: getSymptomName(code),
      userCF: parseFloat(cf),
    };
  });
}