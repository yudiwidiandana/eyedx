"use client";

import { useState, useEffect } from "react";

interface SymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  symptom?: {
    no: number;
    kodeGejala: string;
    namaGejala: string;
    symptomsName: string;
  };
}

export default function SymptomModal({ isOpen, onClose, onSave, symptom }: SymptomModalProps) {
  const [formData, setFormData] = useState({
    kodeGejala: "",
    namaGejala: "",
    symptomsName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (symptom) {
      setFormData({
        kodeGejala: symptom.kodeGejala,
        namaGejala: symptom.namaGejala,
        symptomsName: symptom.symptomsName,
      });
    } else {
      setFormData({ kodeGejala: "", namaGejala: "", symptomsName: "" });
    }
    setError("");
  }, [symptom, isOpen]);

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
      const url = symptom
        ? `/api/admin/symptoms/${symptom.no}`
        : "/api/admin/symptoms";
      const method = symptom ? "PUT" : "POST";

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
        setError(data.error || "Failed to save symptom");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">
          {symptom ? "Edit Symptom" : "Add New Symptom"}
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
                Symptom Code
              </label>
              <input
                type="text"
                value={formData.kodeGejala}
                onChange={(e) => setFormData({ ...formData, kodeGejala: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., G01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Indonesian Name
              </label>
              <input
                type="text"
                value={formData.namaGejala}
                onChange={(e) => setFormData({ ...formData, namaGejala: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mata kering"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                English Name
              </label>
              <input
                type="text"
                value={formData.symptomsName}
                onChange={(e) => setFormData({ ...formData, symptomsName: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., dry eyes"
                required
              />
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
