import expertSystemData from '../table/expertSystem.json';
import symptomsData from '../table/symptoms.json';
import type { ExpertSystemSymptom, Symptom, SymptomResponse } from './types';
import { normalizeSymptomCode } from './expertSystem';

const ALL_DISEASES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

/**
 * Get list of diseases that are still possible based on user responses
 * Uses STRICT ELIMINATION: If user reports a symptom (CF > 0) and disease has null CF, eliminate disease
 */
export function getActiveDiseases(responses: SymptomResponse[]): string[] {
  const expertSymptoms = expertSystemData.symptoms as ExpertSystemSymptom[];
  const activeDiseases = new Set(ALL_DISEASES);

  // Check each response where user reported the symptom
  responses.forEach(response => {
    if (response.userCF === 0) return; // User didn't report this symptom, skip

    // Find expert data for this symptom
    const normalizedCode = normalizeSymptomCode(response.symptomCode);
    const expertSymptom = expertSymptoms.find(
      es => normalizeSymptomCode(es.kodeGejala) === normalizedCode
    );

    if (!expertSymptom) return;

    // Check each disease - eliminate if CF is null
    ALL_DISEASES.forEach(disease => {
      const expertCF = expertSymptom.cf[disease as keyof typeof expertSymptom.cf];
      if (expertCF === null) {
        activeDiseases.delete(disease);
      }
    });
  });

  return Array.from(activeDiseases);
}

/**
 * Get symptoms that are relevant to at least one active disease
 * Excludes already answered symptoms
 */
export function getRelevantSymptoms(
  activeDiseases: string[],
  answeredSymptomCodes: string[],
  allSymptoms: Symptom[]
): Symptom[] {
  if (activeDiseases.length === 0) return [];

  const expertSymptoms = expertSystemData.symptoms as ExpertSystemSymptom[];
  const answeredNormalized = new Set(answeredSymptomCodes.map(normalizeSymptomCode));

  return allSymptoms.filter(symptom => {
    const normalizedCode = normalizeSymptomCode(symptom.kodeGejala);
    
    // Skip if already answered
    if (answeredNormalized.has(normalizedCode)) return false;

    // Find expert data for this symptom
    const expertSymptom = expertSymptoms.find(
      es => normalizeSymptomCode(es.kodeGejala) === normalizedCode
    );

    if (!expertSymptom) return false;

    // Check if this symptom is relevant to at least one active disease
    return activeDiseases.some(disease => {
      const expertCF = expertSymptom.cf[disease as keyof typeof expertSymptom.cf];
      return expertCF !== null; // Relevant if CF is not null
    });
  });
}

/**
 * Calculate elimination power for a symptom
 * Returns: number of active diseases that would be eliminated if user answers "yes" (CF > 0)
 */
function calculateEliminationPower(
  symptom: Symptom,
  activeDiseases: string[]
): number {
  const expertSymptoms = expertSystemData.symptoms as ExpertSystemSymptom[];
  const normalizedCode = normalizeSymptomCode(symptom.kodeGejala);
  
  const expertSymptom = expertSymptoms.find(
    es => normalizeSymptomCode(es.kodeGejala) === normalizedCode
  );

  if (!expertSymptom) return 0;

  // Count how many active diseases have null CF for this symptom
  let eliminationCount = 0;
  activeDiseases.forEach(disease => {
    const expertCF = expertSymptom.cf[disease as keyof typeof expertSymptom.cf];
    if (expertCF === null) {
      eliminationCount++;
    }
  });

  return eliminationCount;
}

/**
 * Calculate average CF for a symptom across active diseases
 * Used as secondary sorting criterion
 */
function calculateAverageCF(
  symptom: Symptom,
  activeDiseases: string[]
): number {
  const expertSymptoms = expertSystemData.symptoms as ExpertSystemSymptom[];
  const normalizedCode = normalizeSymptomCode(symptom.kodeGejala);
  
  const expertSymptom = expertSymptoms.find(
    es => normalizeSymptomCode(es.kodeGejala) === normalizedCode
  );

  if (!expertSymptom) return 0;

  let totalCF = 0;
  let count = 0;

  activeDiseases.forEach(disease => {
    const expertCF = expertSymptom.cf[disease as keyof typeof expertSymptom.cf];
    if (expertCF !== null) {
      totalCF += expertCF;
      count++;
    }
  });

  return count > 0 ? totalCF / count : 0;
}

/**
 * Prioritize symptoms by elimination power
 * Primary sort: elimination power (higher = more diseases can be eliminated)
 * Secondary sort: average CF (higher = more diagnostic value)
 */
export function prioritizeSymptomsByEliminationPower(
  relevantSymptoms: Symptom[],
  activeDiseases: string[]
): Symptom[] {
  return relevantSymptoms
    .map(symptom => ({
      symptom,
      eliminationPower: calculateEliminationPower(symptom, activeDiseases),
      averageCF: calculateAverageCF(symptom, activeDiseases),
    }))
    .sort((a, b) => {
      // Primary: elimination power (descending)
      if (b.eliminationPower !== a.eliminationPower) {
        return b.eliminationPower - a.eliminationPower;
      }
      // Secondary: average CF (descending)
      return b.averageCF - a.averageCF;
    })
    .map(item => item.symptom);
}

/**
 * Get the next question to ask
 * Returns null if no more relevant questions
 */
export function getNextQuestion(
  responses: SymptomResponse[],
  allSymptoms: Symptom[],
  answeredSymptomCodes: string[]
): Symptom | null {
  // Get active diseases based on responses so far
  const activeDiseases = getActiveDiseases(responses);

  if (activeDiseases.length === 0) {
    // All diseases eliminated - shouldn't normally happen, but stop questionnaire
    return null;
  }

  // Get relevant symptoms (answeredSymptomCodes now passed as parameter)
  const relevantSymptoms = getRelevantSymptoms(
    activeDiseases,
    answeredSymptomCodes,
    allSymptoms
  );

  if (relevantSymptoms.length === 0) {
    // No more relevant questions
    return null;
  }

  // Prioritize by elimination power
  const prioritizedSymptoms = prioritizeSymptomsByEliminationPower(
    relevantSymptoms,
    activeDiseases
  );

  // Return the top priority symptom
  return prioritizedSymptoms[0];
}

/**
 * Check if questionnaire should stop
 * Returns true if no more relevant questions to ask
 */
export function shouldStopQuestionnaire(
  responses: SymptomResponse[],
  allSymptoms: Symptom[],
  answeredSymptomCodes: string[]
): boolean {
  const nextQuestion = getNextQuestion(responses, allSymptoms, answeredSymptomCodes);
  return nextQuestion === null;
}

/**
 * Build complete question queue
 * Returns array of symptom codes in priority order
 */
export function buildQuestionQueue(
  responses: SymptomResponse[],
  allSymptoms: Symptom[],
  answeredSymptomCodes: string[]
): string[] {
  const activeDiseases = getActiveDiseases(responses);
  
  if (activeDiseases.length === 0) return [];

  const relevantSymptoms = getRelevantSymptoms(
    activeDiseases,
    answeredSymptomCodes,
    allSymptoms
  );

  const prioritizedSymptoms = prioritizeSymptomsByEliminationPower(
    relevantSymptoms,
    activeDiseases
  );

  return prioritizedSymptoms.map(s => s.kodeGejala);
}
