import { describe, it, expect, vi } from "vitest";

const EXPERT_SYSTEM_FIXTURE = [
  { no: 1, kodeGejala: "G1", cf: { P1: null, P2: null, P3: null, P4: 0.8, P5: 0.5, P6: 1.0 } },
  { no: 2, kodeGejala: "G2", cf: { P1: 0.8, P2: 0.8, P3: null, P4: 0.2, P5: 0.8, P6: 0.5 } },
  { no: 7, kodeGejala: "G7", cf: { P1: 1.0, P2: null, P3: null, P4: null, P5: 1.0, P6: null } },
  { no: 10, kodeGejala: "G10", cf: { P1: 1.0, P2: 1.0, P3: null, P4: 0.8, P5: 0.8, P6: 1.0 } },
  { no: 23, kodeGejala: "G23", cf: { P1: 1.0, P2: 1.0, P3: 1.0, P4: 1.0, P5: 1.0, P6: 1.0 } },
];

const ILLNESSES_FIXTURE = [
  { no: 1, kodePenyakit: "P1", namaPenyakit: "Blefaritis" },
  { no: 2, kodePenyakit: "P2", namaPenyakit: "Hordeolum" },
  { no: 3, kodePenyakit: "P3", namaPenyakit: "Chalazion" },
  { no: 4, kodePenyakit: "P4", namaPenyakit: "Asthenopia" },
  { no: 5, kodePenyakit: "P5", namaPenyakit: "Konjungtivitis" },
  { no: 6, kodePenyakit: "P6", namaPenyakit: "Dry Eye Syndrome" },
];

vi.mock("./db", () => ({
  getSymptoms: vi.fn().mockResolvedValue([]),
  getIllnesses: vi.fn().mockResolvedValue(ILLNESSES_FIXTURE),
  getExpertSystem: vi.fn().mockResolvedValue(EXPERT_SYSTEM_FIXTURE),
}));

const { calculateDiagnosis, resolveDiagnosisResults } = await import("./expertSystem");

function percentageOf(results: Awaited<ReturnType<typeof calculateDiagnosis>>, code: string) {
  return results.find(r => r.diseaseCode === code)?.percentage;
}

describe("calculateDiagnosis — kasus uji bagian 10", () => {
  it("kasus 1: G01 moderate (0.5) -> P6 = 0.50", async () => {
    const results = await calculateDiagnosis([
      { symptomCode: "G1", symptomName: "Mata kering", userCF: 0.5 },
    ]);
    expect(percentageOf(results, "P6")).toBe(50);
  });

  it("kasus 2: G02 moderate, G07 fairly-severe, G10 moderate -> P1 = 0.94", async () => {
    const results = await calculateDiagnosis([
      { symptomCode: "G2", symptomName: "Mata gatal", userCF: 0.5 },
      { symptomCode: "G7", symptomName: "Mata terasa lengket saat bangun tidur", userCF: 0.8 },
      { symptomCode: "G10", symptomName: "Nyeri mata ringan", userCF: 0.5 },
    ]);
    expect(percentageOf(results, "P1")).toBe(94);
    expect(percentageOf(results, "P2")).toBe(70);
    expect(percentageOf(results, "P4")).toBe(46);
    expect(percentageOf(results, "P6")).toBe(63);
    expect(percentageOf(results, "P3")).toBe(0);
  });

  it("kasus 2: kecocokan aturan ikut dihitung tanpa mengubah persentase", async () => {
    const results = await calculateDiagnosis([
      { symptomCode: "G2", symptomName: "Mata gatal", userCF: 0.5 },
      { symptomCode: "G7", symptomName: "Mata terasa lengket saat bangun tidur", userCF: 0.8 },
      { symptomCode: "G10", symptomName: "Nyeri mata ringan", userCF: 0.5 },
    ]);
    expect(results.find(r => r.diseaseCode === "P1")?.ruleMatch).toEqual({ matched: 3, total: 12 });
    expect(results.find(r => r.diseaseCode === "P3")?.ruleMatch).toEqual({ matched: 0, total: 5 });
    expect(percentageOf(results, "P5")).toBe(93);
  });

  it("kasus 3: urutan gejala dibalik -> P1 tetap 0.94 (combine komutatif)", async () => {
    const results = await calculateDiagnosis([
      { symptomCode: "G10", symptomName: "Nyeri mata ringan", userCF: 0.5 },
      { symptomCode: "G7", symptomName: "Mata terasa lengket saat bangun tidur", userCF: 0.8 },
      { symptomCode: "G2", symptomName: "Mata gatal", userCF: 0.5 },
    ]);
    expect(percentageOf(results, "P1")).toBe(94);
  });

  it("kasus 4: tidak ada gejala dijawab -> semua penyakit 0, tidak error", async () => {
    const results = await calculateDiagnosis([
      { symptomCode: "G1", symptomName: "Mata kering", userCF: 0 },
    ]);
    expect(results).toHaveLength(6);
    expect(results.every(r => r.percentage === 0)).toBe(true);
  });

  it("kasus 5: G23 very-severe (CF pakar 1 di keenam penyakit) -> keenam penyakit = 1.00", async () => {
    const results = await calculateDiagnosis([
      { symptomCode: "G23", symptomName: "Ketidaknyamanan mata", userCF: 1.0 },
    ]);
    expect(results.every(r => r.percentage === 100)).toBe(true);
  });
});

describe("resolveDiagnosisResults", () => {
  it("memakai snapshot tersimpan apa adanya, tanpa hitung ulang (T3)", async () => {
    const snapshot = {
      responses: [{ symptomCode: "G2", symptomName: "Mata gatal", userCF: 0.5 }],
      results: [
        {
          diseaseCode: "P1",
          diseaseName: "Blefaritis",
          cfValue: 0.94,
          percentage: 94,
          contributingSymptoms: ["Mata gatal"],
        },
      ],
    };

    const resolved = await resolveDiagnosisResults({
      responses: "G2:0.5",
      resultsSnapshot: JSON.stringify(snapshot),
    });

    expect(resolved).toEqual(snapshot);
  });

  it("jatuh ke hitung ulang kalau tidak ada snapshot sama sekali (rekaman lama T3)", async () => {
    const resolved = await resolveDiagnosisResults({
      responses: "",
      resultsSnapshot: null,
    });

    expect(resolved.responses).toEqual([]);
    expect(resolved.results).toHaveLength(6);
  });

  it("mengabaikan snapshot yang rusak/tidak valid dan jatuh ke hitung ulang, bukan crash", async () => {
    const resolved = await resolveDiagnosisResults({
      responses: "",
      resultsSnapshot: "{not valid json",
    });

    expect(resolved.responses).toEqual([]);
  });
});
