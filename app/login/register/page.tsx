"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import { translations, type Locale } from "../../lib/translations";

// hanya izinkan path internal supaya ?next= tidak bisa dipakai mengarahkan ke situs lain
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

const MIN_PASSWORD_LENGTH = 8;

const fieldClass =
  "block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 leading-6 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
const inputClass = `mt-2 ${fieldClass}`;
// appearance-none supaya select menuruti leading-6 dan tingginya sama dengan input
const selectClass = `${fieldClass} appearance-none pr-10`;
const labelClass = "block text-sm font-semibold text-zinc-700";

function RegisterForm({ locale }: { locale: Locale }) {
  const t = translations[locale].authPage;
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNext(searchParams.get("next"));
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginBase = `/${locale === "en" ? "login" : `${locale}/login`}`;
  const loginHref = nextPath ? `${loginBase}?next=${encodeURIComponent(nextPath)}` : loginBase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAge = Number(age);
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 150) {
      setError(t.errorInvalidAge);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.errorPasswordTooShort.replace("{min}", String(MIN_PASSWORD_LENGTH)));
      return;
    }

    if (password !== confirmPassword) {
      setError(t.errorPasswordMismatch);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username,
          name,
          age: parsedAge,
          gender,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.errorRegisterFailed);
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      router.push(nextPath || `/${locale === "en" ? "" : locale}`);
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
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold text-zinc-900">{t.registerTitle}</h1>
            <p className="mt-2 text-sm text-zinc-600">{t.registerSubtitle}</p>

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className={labelClass}>
                  {t.usernameLabel}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="name" className={labelClass}>
                  {t.fullnameLabel}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="age" className={labelClass}>
                    {t.ageLabel}
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="150"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className={labelClass}>
                    {t.genderLabel}
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">{t.genderPlaceholder}</option>
                      <option value="laki-laki">{t.genderMale}</option>
                      <option value="perempuan">{t.genderFemale}</option>
                      <option value="lainnya">{t.genderOther}</option>
                    </select>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  {t.passwordLabel}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder={t.passwordHint.replace("{min}", String(MIN_PASSWORD_LENGTH))}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                  {t.confirmPasswordLabel}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder={t.confirmPasswordHint}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? t.registerButtonLoading : t.registerButton}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-600">
            <Link href={loginHref} className="font-semibold text-blue-600 transition hover:text-blue-700">
              {t.toLogin}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export function RegisterPageContent({ locale }: { locale: Locale }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-zinc-50">
          <Header locale={locale} />
          <main className="flex flex-1 items-center justify-center">
            <p className="text-lg text-zinc-600">Loading...</p>
          </main>
        </div>
      }
    >
      <RegisterForm locale={locale} />
    </Suspense>
  );
}

export default function RegisterPage() {
  return <RegisterPageContent locale="en" />;
}
