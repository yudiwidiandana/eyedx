import { describe, it, expect } from "vitest";
import { getRuleMatch, RULES } from "./rules";
import expertSystemJson from "../table/expertSystem.json";
import { normalizeSymptomCode } from "./symptomUtils";

const kasusBab3 = [
  { symptomCode: "G2", symptomName: "Mata gatal", userCF: 0.5 },
  { symptomCode: "G7", symptomName: "Mata terasa lengket saat bangun tidur", userCF: 0.8 },
  { symptomCode: "G10", symptomName: "Nyeri mata ringan", userCF: 0.5 },
];

describe("getRuleMatch", () => {
  it("menghitung gejala inti yang terpenuhi pada kasus Bab III", () => {
    expect(getRuleMatch("P1", kasusBab3)).toEqual({ matched: 3, total: 12 });
    expect(getRuleMatch("P2", kasusBab3)).toEqual({ matched: 2, total: 8 });
    expect(getRuleMatch("P3", kasusBab3)).toEqual({ matched: 0, total: 5 });
    expect(getRuleMatch("P4", kasusBab3)).toEqual({ matched: 0, total: 12 });
    expect(getRuleMatch("P5", kasusBab3)).toEqual({ matched: 2, total: 16 });
    expect(getRuleMatch("P6", kasusBab3)).toEqual({ matched: 1, total: 16 });
  });

  it("memperlakukan G2 dan G02 sebagai gejala yang sama", () => {
    const a = getRuleMatch("P1", [{ symptomCode: "G02", symptomName: "x", userCF: 0.5 }]);
    const b = getRuleMatch("P1", [{ symptomCode: "G2", symptomName: "x", userCF: 0.5 }]);
    expect(a).toEqual({ matched: 1, total: 12 });
    expect(b).toEqual(a);
  });

  it("mengabaikan gejala yang dijawab tidak ada (userCF 0)", () => {
    expect(getRuleMatch("P1", [{ symptomCode: "G2", symptomName: "x", userCF: 0 }])).toEqual({ matched: 0, total: 12 });
  });

  it("semua gejala inti terjawab bergejala -> matched sama dengan total", () => {
    const p3 = RULES.find((r) => r.kodePenyakit === "P3")!;
    const semua = p3.gejala.map((g) => ({ symptomCode: g, symptomName: g, userCF: 0.2 }));
    expect(getRuleMatch("P3", semua)).toEqual({ matched: 5, total: 5 });
  });

  it("penyakit tanpa aturan mengembalikan undefined", () => {
    expect(getRuleMatch("P9", kasusBab3)).toBeUndefined();
  });
});

describe("data aturan Tabel 3.7", () => {
  it("memuat 6 aturan dengan 69 pasangan gejala-penyakit", () => {
    expect(RULES.map((r) => r.gejala.length)).toEqual([12, 8, 5, 12, 16, 16]);
    expect(RULES.reduce((n, r) => n + r.gejala.length, 0)).toBe(69);
  });

  it("tiap gejala inti punya CF pakar non-null untuk penyakitnya (aturan subset matriks)", () => {
    for (const rule of RULES) {
      for (const g of rule.gejala) {
        const baris = expertSystemJson.symptoms.find((s) => normalizeSymptomCode(s.kodeGejala) === normalizeSymptomCode(g));
        const cf = baris?.cf[rule.kodePenyakit as keyof typeof baris.cf];
        expect(cf, `${rule.kodePenyakit} ${g}`).toBeGreaterThan(0);
      }
    }
  });

  it("tidak ada gejala ganda dalam satu aturan", () => {
    for (const rule of RULES) {
      expect(new Set(rule.gejala).size).toBe(rule.gejala.length);
    }
  });
});
