"use client";

import { useState, useEffect } from "react";

interface IllnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  illness?: {
    no: number;
    kodePenyakit: string;
    namaPenyakit: string;
  };
}

export default function IllnessModal({ isOpen, onClose, onSave, illness }: IllnessModalProps) {
  const [formData, setFormData] = useState({
    kodePenyakit: "",
    namaPenyakit: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (illness) {
      setFormData({
        kodePenyakit: illness.kodePenyakit,
        namaPenyakit: illness.namaPenyakit,
      });
    } else {
      setFormData({ kodePenyakit: "", namaPenyakit: "" });
    }
    setError("");
  }, [illness, isOpen]);

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
      const url = illness
        ? `/api/admin/illnesses/${illness.no}`
        : "/api/admin/illnesses";
      const method = illness ? "PUT" : "POST";

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
        setError(data.error || "Failed to save illness");
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
          {illness ? "Edit Illness" : "Add New Illness"}
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
                Illness Code
              </label>
              <input
                type="text"
                value={formData.kodePenyakit}
                onChange={(e) => setFormData({ ...formData, kodePenyakit: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., P1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Illness Name
              </label>
              <input
                type="text"
                value={formData.namaPenyakit}
                onChange={(e) => setFormData({ ...formData, namaPenyakit: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Blefaritis"
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
