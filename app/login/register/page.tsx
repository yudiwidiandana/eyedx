"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import { translations, type Locale } from "../../lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// hanya izinkan path internal supaya ?next= tidak bisa dipakai mengarahkan ke situs lain
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

const MIN_PASSWORD_LENGTH = 8;

function RegisterForm({ locale }: { locale: Locale }) {
  const t = translations[locale].authPage;
  const genderLabels: Record<string, string> = {
    "laki-laki": t.genderMale,
    perempuan: t.genderFemale,
    lainnya: t.genderOther,
  };
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
    <div className="flex min-h-screen flex-col bg-background">
      <Header locale={locale} />
      <main className="flex flex-1 items-center justify-center px-6 py-24 sm:px-8">
        <div className="w-full max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t.registerTitle}</CardTitle>
              <CardDescription>{t.registerSubtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-5">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="username">{t.usernameLabel}</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">{t.fullnameLabel}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">{t.ageLabel}</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="1"
                      max="150"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">{t.genderLabel}</Label>
                    <Select
                      value={gender}
                      onValueChange={(value) => setGender(value ?? "")}
                      name="gender"
                      required
                    >
                      <SelectTrigger id="gender" className="w-full !h-11">
                        <SelectValue placeholder={t.genderPlaceholder}>
                          {(value: string | null) => genderLabels[value ?? ""] ?? t.genderPlaceholder}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laki-laki">{t.genderMale}</SelectItem>
                        <SelectItem value="perempuan">{t.genderFemale}</SelectItem>
                        <SelectItem value="lainnya">{t.genderOther}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t.passwordLabel}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordHint.replace("{min}", String(MIN_PASSWORD_LENGTH))}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPasswordHint}
                    className="h-11"
                  />
                </div>

                <Button type="submit" disabled={loading} className="h-11 w-full text-base">
                  {loading ? t.registerButtonLoading : t.registerButton}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href={loginHref} className="font-semibold text-foreground underline underline-offset-4 transition hover:text-muted-foreground">
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
        <div className="flex min-h-screen flex-col bg-background">
          <Header locale={locale} />
          <main className="flex flex-1 items-center justify-center">
            <p className="text-lg text-muted-foreground">Loading...</p>
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
