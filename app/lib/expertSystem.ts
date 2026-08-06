import symptomsData from '../table/symptoms.json';
import illnessesData from '../table/illnesses.json';
import expertSystemData from '../table/expertSystem.json';
import type { Symptom, Illness, ExpertSystemSymptom, DiagnosisResult, SymptomResponse } from './types';

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
export function calculateDiagnosis(responses: SymptomResponse[]): DiagnosisResult[] {
  const diseases = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
  const results: DiagnosisResult[] = [];

  // Get expert system data
  const expertSymptoms = expertSystemData.symptoms as ExpertSystemSymptom[];

  // For each disease, calculate combined CF
  diseases.forEach(diseaseCode => {
    let combinedCF = 0;
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
      
      // Skip if expert system has no correlation (null CF)
      if (expertCF === null) return;

      // Calculate symptom CF
      const symptomCF = calculateSymptomCF(expertCF, response.userCF);

      // Combine with previous CF
      if (combinedCF === 0) {
        combinedCF = symptomCF;
      } else {
        combinedCF = combineCF(combinedCF, symptomCF);
      }

      // Add to contributing symptoms
      contributingSymptoms.push(response.symptomName);
    });

    // Create result for this disease
    results.push({
      diseaseCode,
      diseaseName: getIllnessName(diseaseCode),
      cfValue: combinedCF,
      percentage: Math.round(combinedCF * 100),
      contributingSymptoms,
    });
  });

  // Sort by CF value (highest first)
  return results.sort((a, b) => b.cfValue - a.cfValue);
}

// Calculate partial diagnosis for questionnaire progress (only answered symptoms)
export function calculatePartialDiagnosis(
  responses: SymptomResponse[],
  activeDiseases: string[]
): DiagnosisResult[] {
  const results: DiagnosisResult[] = [];
  const expertSymptoms = expertSystemData.symptoms as ExpertSystemSymptom[];

  // Only calculate for active diseases
  activeDiseases.forEach(diseaseCode => {
    let combinedCF = 0;
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
      
      // Skip if expert system has no correlation (null CF)
      if (expertCF === null) return;

      // Calculate symptom CF
      const symptomCF = calculateSymptomCF(expertCF, response.userCF);

      // Combine with previous CF
      if (combinedCF === 0) {
        combinedCF = symptomCF;
      } else {
        combinedCF = combineCF(combinedCF, symptomCF);
      }

      // Add to contributing symptoms
      contributingSymptoms.push(response.symptomName);
    });

    // Create result for this disease
    results.push({
      diseaseCode,
      diseaseName: getIllnessName(diseaseCode),
      cfValue: combinedCF,
      percentage: Math.round(combinedCF * 100),
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
