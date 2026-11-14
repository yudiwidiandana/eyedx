"use client";

import { useState } from "react";
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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <IllnessForm key={illness?.no ?? "new"} illness={illness} onClose={onClose} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
}

function IllnessForm({ onClose, onSave, illness }: Omit<IllnessModalProps, "isOpen">) {
  const [formData, setFormData] = useState({
    kodePenyakit: illness?.kodePenyakit ?? "",
    namaPenyakit: illness?.namaPenyakit ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

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
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{illness ? "Edit Illness" : "Add New Illness"}</DialogTitle>
      </DialogHeader>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!illness && (
        <Alert>
          <AlertDescription>
            Mesin CF hanya menghitung penyakit P1-P6, jadi kode lain akan ditolak.
          </AlertDescription>
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
              disabled={!!illness}
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
    </>
  );
}
