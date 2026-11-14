import { describe, it, expect } from "vitest";
import { normalizeSymptomCode, encodeResponses, isValidSymptomCode, isSymptomReferenced } from "./symptomUtils";

describe("isValidSymptomCode", () => {
  it("menerima format G01 hingga G39 sesuai konvensi tabel symptoms", () => {
    expect(isValidSymptomCode("G01")).toBe(true);
    expect(isValidSymptomCode("G39")).toBe(true);
  });

  it("menerima batas tiap rentang digit: G09, G10, G29, G30", () => {
    for (const code of ["G09", "G10", "G29", "G30"]) {
      expect(isValidSymptomCode(code)).toBe(true);
    }
  });

  it("menolak kode di luar G01-G39 seperti G00, G40, dan G99", () => {
    for (const code of ["G00", "G40", "G50", "G99"]) {
      expect(isValidSymptomCode(code)).toBe(false);
    }
  });

  it("menolak kode tanpa padding nol, huruf kecil, atau format lain yang akan lolos tak terdeteksi", () => {
    expect(isValidSymptomCode("G1")).toBe(false);
    expect(isValidSymptomCode("g01")).toBe(false);
    expect(isValidSymptomCode("G001")).toBe(false);
    expect(isValidSymptomCode("P01")).toBe(false);
    expect(isValidSymptomCode("")).toBe(false);
  });
});

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

describe("isSymptomReferenced", () => {
  const entries = [{ kodeGejala: "G1" }, { kodeGejala: "G10" }];

  it("mengenali G01 sebagai G1 di expert_system", () => {
    expect(isSymptomReferenced("G01", entries)).toBe(true);
  });

  it("G10 tidak bentrok dengan G1 maupun sebaliknya", () => {
    expect(isSymptomReferenced("G10", [{ kodeGejala: "G1" }])).toBe(false);
    expect(isSymptomReferenced("G01", [{ kodeGejala: "G10" }])).toBe(false);
  });

  it("false bila gejala tidak punya baris CF", () => {
    expect(isSymptomReferenced("G05", entries)).toBe(false);
    expect(isSymptomReferenced("G05", [])).toBe(false);
  });
});
