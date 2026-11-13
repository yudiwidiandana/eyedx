"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{symptom ? "Edit Symptom" : "Add New Symptom"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kodeGejala">Symptom Code</Label>
              <Input
                id="kodeGejala"
                type="text"
                value={formData.kodeGejala}
                onChange={(e) => setFormData({ ...formData, kodeGejala: e.target.value })}
                placeholder="e.g., G01"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaGejala">Indonesian Name</Label>
              <Input
                id="namaGejala"
                type="text"
                value={formData.namaGejala}
                onChange={(e) => setFormData({ ...formData, namaGejala: e.target.value })}
                placeholder="e.g., Mata kering"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptomsName">English Name</Label>
              <Input
                id="symptomsName"
                type="text"
                value={formData.symptomsName}
                onChange={(e) => setFormData({ ...formData, symptomsName: e.target.value })}
                placeholder="e.g., dry eyes"
                required
                className="h-11"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
