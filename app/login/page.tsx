"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";

export function LoginPageContent({ locale }: { locale: Locale }) {
  const t = translations[locale].authPage;
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerHref = `/${locale === "en" ? "login/register" : `${locale}/login/register`}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.errorLoginFailed);
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      router.push(`/${locale === "en" ? "" : locale}`);
      router.refresh();
    } catch {
      setError(t.errorNetwork);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header locale={locale} />
      <main className="flex flex-1 items-center justify-center px-6 py-24 sm:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold text-zinc-900">{t.loginTitle}</h1>
            <p className="mt-2 text-sm text-zinc-600">{t.loginSubtitle}</p>

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-zinc-700">
                  {t.usernameLabel}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-zinc-700">
                  {t.passwordLabel}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? t.loginButtonLoading : t.loginButton}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-600">
            <Link href={registerHref} className="font-semibold text-blue-600 transition hover:text-blue-700">
              {t.toRegister}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return <LoginPageContent locale="en" />;
}
