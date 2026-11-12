"use client";

import { useState, useEffect } from "react";

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

const fieldClass =
  "block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 leading-6 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
const labelClass = "block text-sm font-medium text-zinc-700";

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
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-zinc-900">
          {isEdit ? "Edit User" : "Add New User"}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          {isEdit ? "Username cannot be changed. Leave password blank to keep it." : "The account can sign in immediately after being created."}
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="u-username" className={labelClass}>Username</label>
            <input
              id="u-username"
              type="text"
              required
              disabled={isEdit}
              value={username}
              onChange={(e) => ubah({ username: e.target.value })}
              className={`mt-1 ${fieldClass} disabled:bg-zinc-100 disabled:text-zinc-500`}
            />
          </div>

          <div>
            <label htmlFor="u-name" className={labelClass}>Full Name</label>
            <input
              id="u-name"
              type="text"
              required
              value={name}
              onChange={(e) => ubah({ name: e.target.value })}
              className={`mt-1 ${fieldClass}`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="u-age" className={labelClass}>Age</label>
              <input
                id="u-age"
                type="number"
                min="1"
                max="150"
                required
                value={age}
                onChange={(e) => ubah({ age: e.target.value })}
                className={`mt-1 ${fieldClass}`}
              />
            </div>
            <div>
              <label htmlFor="u-gender" className={labelClass}>Gender</label>
              <select
                id="u-gender"
                required
                value={gender}
                onChange={(e) => ubah({ gender: e.target.value })}
                className={fieldClass + " mt-1"}
              >
                <option value="">Select gender</option>
                <option value="laki-laki">Male</option>
                <option value="perempuan">Female</option>
                <option value="lainnya">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="u-password" className={labelClass}>
                {isEdit ? "New Password" : "Password"}
              </label>
              <input
                id="u-password"
                type="password"
                required={!isEdit}
                value={password}
                onChange={(e) => ubah({ password: e.target.value })}
                className={`mt-1 ${fieldClass}`}
                placeholder={isEdit ? "Leave blank to keep current" : `At least ${MIN_PASSWORD_LENGTH} characters`}
              />
            </div>
            <div>
              <label htmlFor="u-confirm" className={labelClass}>Confirm Password</label>
              <input
                id="u-confirm"
                type="password"
                required={!isEdit || !!password}
                disabled={isEdit && !password}
                value={confirmPassword}
                onChange={(e) => ubah({ confirmPassword: e.target.value })}
                className={`mt-1 ${fieldClass} disabled:bg-zinc-100 disabled:text-zinc-500`}
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="u-role" className={labelClass}>Role</label>
            <select
              id="u-role"
              required
              disabled={isSelf}
              value={role}
              onChange={(e) => ubah({ role: e.target.value as AdminUser["role"] })}
              className={`mt-1 ${fieldClass} disabled:bg-zinc-100 disabled:text-zinc-500`}
            >
              <option value="user">User</option>
              <option value="expert">Expert</option>
              <option value="admin">Admin</option>
            </select>
            {isSelf && (
              <p className="mt-1 text-xs text-zinc-500">You cannot change your own role.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isSelf}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
