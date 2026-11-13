import { describe, it, expect } from "vitest";
import { normalizeSymptomCode, encodeResponses } from "./symptomUtils";

describe("normalizeSymptomCode", () => {
  it("mengubah format G01 (symptoms.json) jadi G1 (expertSystem.json)", () => {
    expect(normalizeSymptomCode("G01")).toBe("G1");
  });

  it("membiarkan format G1 yang sudah benar", () => {
    expect(normalizeSymptomCode("G1")).toBe("G1");
  });

  it("menangani kode dua digit seperti G10 dan G39", () => {
    expect(normalizeSymptomCode("G10")).toBe("G10");
    expect(normalizeSymptomCode("G39")).toBe("G39");
  });
});

describe("encodeResponses", () => {
  it("hanya menyertakan gejala dengan userCF > 0, dan menormalkan kodenya", () => {
    const encoded = encodeResponses([
      { symptomCode: "G02", symptomName: "Mata gatal", userCF: 0.5 },
      { symptomCode: "G03", symptomName: "Mata perih", userCF: 0 },
      { symptomCode: "G07", symptomName: "Mata lengket", userCF: 0.8 },
    ]);

    expect(encoded).toBe("G2:0.5,G7:0.8");
  });

  it("menghasilkan string kosong kalau tidak ada gejala yang dijawab", () => {
    const encoded = encodeResponses([
      { symptomCode: "G01", symptomName: "Mata kering", userCF: 0 },
    ]);

    expect(encoded).toBe("");
  });
});
