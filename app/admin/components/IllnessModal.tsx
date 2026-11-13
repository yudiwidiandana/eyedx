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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{illness ? "Edit Illness" : "Add New Illness"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kodePenyakit">Illness Code</Label>
              <Input
                id="kodePenyakit"
                type="text"
                value={formData.kodePenyakit}
                onChange={(e) => setFormData({ ...formData, kodePenyakit: e.target.value })}
                placeholder="e.g., P1"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaPenyakit">Illness Name</Label>
              <Input
                id="namaPenyakit"
                type="text"
                value={formData.namaPenyakit}
                onChange={(e) => setFormData({ ...formData, namaPenyakit: e.target.value })}
                placeholder="e.g., Blefaritis"
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
