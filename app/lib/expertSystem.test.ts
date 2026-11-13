import { describe, it, expect, vi } from "vitest";

// hindari koneksi database sungguhan saat test — jalur hitung ulang di
// calculateDiagnosis() selalu memanggil getExpertSystem()/getIllnesses()
vi.mock("./db", () => ({
  getSymptoms: vi.fn().mockResolvedValue([]),
  getIllnesses: vi.fn().mockResolvedValue([]),
  getExpertSystem: vi.fn().mockResolvedValue([]),
}));

const { resolveDiagnosisResults } = await import("./expertSystem");

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
    expect(resolved.results).toHaveLength(6); // tetap hitung 6 penyakit P1-P6
  });

  it("mengabaikan snapshot yang rusak/tidak valid dan jatuh ke hitung ulang, bukan crash", async () => {
    const resolved = await resolveDiagnosisResults({
      responses: "",
      resultsSnapshot: "{not valid json",
    });

    expect(resolved.responses).toEqual([]);
  });
});
