// Patient information from diagnosis page
export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
}

// User's response to a symptom question
export interface SymptomResponse {
  symptomCode: string;
  symptomName: string;
  userCF: number; // 0, 0.4, 0.6, 0.8, or 1.0
}

// Final diagnosis result
export interface DiagnosisResult {
  diseaseCode: string;
  diseaseName: string;
  cfValue: number; // Combined CF value
  percentage: number; // CF as percentage (0-100)
  contributingSymptoms: string[]; // List of symptom names that contributed
}

// Symptom data structure from symptoms.json
export interface Symptom {
  no: number;
  kodeGejala: string;
  namaGejala: string;
}

// Illness data structure from illnesses.json
export interface Illness {
  no: number;
  kodePenyakit: string;
  namaPenyakit: string;
}

// Expert system CF data structure
export interface ExpertSystemSymptom {
  no: number;
  kodeGejala: string;
  cf: {
    P1: number | null;
    P2: number | null;
    P3: number | null;
    P4: number | null;
    P5: number | null;
    P6: number | null;
  };
}

// Severity levels for user input
export type SeverityLevel = 'none' | 'mild' | 'moderate' | 'fairly-severe' | 'very-severe';

// Mapping of severity levels to CF values
export const severityCFMap: Record<SeverityLevel, number> = {
  'none': 0.0,
  'mild': 0.2,
  'moderate': 0.5,
  'fairly-severe': 0.8,
  'very-severe': 1.0,
};
