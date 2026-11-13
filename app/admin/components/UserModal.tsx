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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  age: number | null;
  gender: string | null;
  role: "user" | "expert" | "admin";
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: AdminUser;
  currentUserId?: string;
}

const MIN_PASSWORD_LENGTH = 8;

const genderLabels: Record<string, string> = {
  "laki-laki": "Male",
  perempuan: "Female",
  lainnya: "Other",
};

const roleLabels: Record<AdminUser["role"], string> = {
  user: "User",
  expert: "Expert",
  admin: "Admin",
};

export default function UserModal({ isOpen, onClose, onSave, user, currentUserId }: UserModalProps) {
  const isEdit = !!user;
  const isSelf = !!user && user.id === currentUserId;

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
    role: "user" as AdminUser["role"],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { username, name, age, gender, password, confirmPassword, role } = formData;
  const ubah = (patch: Partial<typeof formData>) => setFormData((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    setFormData({
      username: user?.username ?? "",
      name: user?.name ?? "",
      age: user?.age == null ? "" : String(user.age),
      gender: user?.gender ?? "",
      password: "",
      confirmPassword: "",
      role: user?.role ?? "user",
    });
    setError("");
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAge = Number(age);
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 150) {
      setError("Age must be a whole number between 1 and 150");
      return;
    }

    // saat edit, password kosong berarti tidak diubah
    if (!isEdit || password) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
        return;
      }
      if (password !== confirmPassword) {
        setError("Password confirmation does not match");
        return;
      }
    }

    setLoading(true);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    try {
      const res = isEdit
        ? await fetch(`/api/admin/users/${user!.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
              name,
              age: parsedAge,
              gender,
              // kosong berarti tidak diubah - jangan kirim field sama sekali
              ...(password ? { password, confirmPassword } : {}),
              role,
            }),
          })
        : await fetch("/api/admin/users", {
            method: "POST",
            headers,
            body: JSON.stringify({ username, name, age: Number(age), gender, password, confirmPassword, role }),
          });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save user");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Username cannot be changed. Leave password blank to keep it."
              : "The account can sign in immediately after being created."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="u-username">Username</Label>
            <Input
              id="u-username"
              type="text"
              required
              disabled={isEdit}
              value={username}
              onChange={(e) => ubah({ username: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="u-name">Full Name</Label>
            <Input
              id="u-name"
              type="text"
              required
              value={name}
              onChange={(e) => ubah({ name: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="u-age">Age</Label>
              <Input
                id="u-age"
                type="number"
                min="1"
                max="150"
                required
                value={age}
                onChange={(e) => ubah({ age: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-gender">Gender</Label>
              <Select value={gender} onValueChange={(value) => ubah({ gender: value ?? "" })} required>
                <SelectTrigger id="u-gender" className="w-full !h-11">
                  <SelectValue placeholder="Select gender">
                    {(value: string | null) => genderLabels[value ?? ""] ?? "Select gender"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laki-laki">Male</SelectItem>
                  <SelectItem value="perempuan">Female</SelectItem>
                  <SelectItem value="lainnya">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="u-password">{isEdit ? "New Password" : "Password"}</Label>
              <Input
                id="u-password"
                type="password"
                required={!isEdit}
                value={password}
                onChange={(e) => ubah({ password: e.target.value })}
                placeholder={isEdit ? "Leave blank to keep current" : `At least ${MIN_PASSWORD_LENGTH} characters`}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-confirm">Confirm Password</Label>
              <Input
                id="u-confirm"
                type="password"
                required={!isEdit || !!password}
                disabled={isEdit && !password}
                value={confirmPassword}
                onChange={(e) => ubah({ confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="u-role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => ubah({ role: (value ?? "user") as AdminUser["role"] })}
              disabled={isSelf}
              required
            >
              <SelectTrigger id="u-role" className="w-full !h-11">
                <SelectValue placeholder="Select role">
                  {(value: string | null) => roleLabels[(value ?? "user") as AdminUser["role"]]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {isSelf && (
              <p className="text-xs text-muted-foreground">You cannot change your own role.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isSelf}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
