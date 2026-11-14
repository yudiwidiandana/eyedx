import rulesJson from "../table/rules.json";
import { normalizeSymptomCode } from "./symptomUtils";
import type { RuleMatch, SymptomResponse } from "./types";

interface Rule {
  kodePenyakit: string;
  gejala: string[];
}

// aturan Tabel 3.7: gejala inti tiap penyakit, statis dan tidak diedit lewat panel admin
export const RULES: Rule[] = rulesJson.rules;

// hitung berapa gejala inti penyakit yang dijawab bergejala; tidak memengaruhi nilai CF
export function getRuleMatch(
  diseaseCode: string,
  responses: SymptomResponse[],
  rules: Rule[] = RULES
): RuleMatch | undefined {
  const rule = rules.find((r) => r.kodePenyakit === diseaseCode);
  if (!rule) return undefined;

  const reported = new Set(
    responses.filter((r) => r.userCF > 0).map((r) => normalizeSymptomCode(r.symptomCode))
  );
  const matched = rule.gejala.filter((g) => reported.has(normalizeSymptomCode(g))).length;

  return { matched, total: rule.gejala.length };
}
