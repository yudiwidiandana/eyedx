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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit Expert System Entry" : "Add New Expert System Entry"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kodeGejala">Symptom</Label>
              {entry ? (
                <Input id="kodeGejala" type="text" value={formData.kodeGejala} disabled className="h-11" />
              ) : (
                <Select
                  value={formData.kodeGejala}
                  onValueChange={(value) => setFormData({ ...formData, kodeGejala: value ?? "" })}
                  required
                >
                  <SelectTrigger id="kodeGejala" className="w-full !h-11">
                    <SelectValue placeholder="Select symptom...">
                      {(value: string | null) => {
                        const match = symptoms.find((s) => s.kodeGejala === value);
                        return match ? `${match.kodeGejala} - ${match.namaGejala}` : "Select symptom...";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {symptoms.map((symptom) => (
                      <SelectItem key={symptom.kodeGejala} value={symptom.kodeGejala}>
                        {symptom.kodeGejala} - {symptom.namaGejala}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                Certainty Factors (0.0 - 1.0 or leave empty for null)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {illnesses.map((illness) => (
                  <div key={illness.kodePenyakit} className="space-y-2">
                    <Label htmlFor={`cf-${illness.kodePenyakit}`}>
                      {illness.kodePenyakit} - {illness.namaPenyakit}
                    </Label>
                    <Input
                      id={`cf-${illness.kodePenyakit}`}
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={formData.cf[illness.kodePenyakit as keyof typeof formData.cf] ?? ""}
                      onChange={(e) => handleCFChange(illness.kodePenyakit, e.target.value)}
                      placeholder="0.0 - 1.0 or empty"
                      className="h-11"
                    />
                  </div>
                ))}
              </div>
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
