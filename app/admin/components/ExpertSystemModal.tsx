"use client";

import { useState, useEffect } from "react";

interface ExpertSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  entry?: {
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
  };
  symptoms: Array<{ kodeGejala: string; namaGejala: string }>;
  illnesses: Array<{ kodePenyakit: string; namaPenyakit: string }>;
}

export default function ExpertSystemModal({
  isOpen,
  onClose,
  onSave,
  entry,
  symptoms,
  illnesses,
}: ExpertSystemModalProps) {
  const [formData, setFormData] = useState({
    kodeGejala: "",
    cf: {
      P1: null as number | null,
      P2: null as number | null,
      P3: null as number | null,
      P4: null as number | null,
      P5: null as number | null,
      P6: null as number | null,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (entry) {
      setFormData({
        kodeGejala: entry.kodeGejala,
        cf: { ...entry.cf },
      });
    } else {
      setFormData({
        kodeGejala: "",
        cf: { P1: null, P2: null, P3: null, P4: null, P5: null, P6: null },
      });
    }
    setError("");
  }, [entry, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = entry
        ? `/api/admin/expert-system/${entry.no}`
        : "/api/admin/expert-system";
      const method = entry ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save expert system entry");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleCFChange = (disease: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setFormData({
      ...formData,
      cf: {
        ...formData.cf,
        [disease]: numValue,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">
          {entry ? "Edit Expert System Entry" : "Add New Expert System Entry"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Symptom
              </label>
              {entry ? (
                <input
                  type="text"
                  value={formData.kodeGejala}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-zinc-100"
                  disabled
                />
              ) : (
                <select
                  value={formData.kodeGejala}
                  onChange={(e) => setFormData({ ...formData, kodeGejala: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select symptom...</option>
                  {symptoms.map((symptom) => (
                    <option key={symptom.kodeGejala} value={symptom.kodeGejala}>
                      {symptom.kodeGejala} - {symptom.namaGejala}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-3">
                Certainty Factors (0.0 - 1.0 or leave empty for null)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {illnesses.map((illness) => (
                  <div key={illness.kodePenyakit}>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      {illness.kodePenyakit} - {illness.namaPenyakit}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={formData.cf[illness.kodePenyakit as keyof typeof formData.cf] ?? ""}
                      onChange={(e) => handleCFChange(illness.kodePenyakit, e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0 - 1.0 or empty"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
