"use client";

import { useState, useEffect } from "react";

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'user' | 'expert' | 'admin';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch("/api/auth/me", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await fetch("/api/auth", {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "logout" }),
    });
    
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = "/";
  };

  return { user, loading, logout };
}
