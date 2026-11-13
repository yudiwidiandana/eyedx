"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// hanya izinkan path internal supaya ?next= tidak bisa dipakai mengarahkan ke situs lain
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function LoginForm({ locale }: { locale: Locale }) {
  const t = translations[locale].authPage;
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNext(searchParams.get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerBase = `/${locale === "en" ? "login/register" : `${locale}/login/register`}`;
  const registerHref = nextPath
    ? `${registerBase}?next=${encodeURIComponent(nextPath)}`
    : registerBase;

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
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t.loginTitle}</CardTitle>
              <CardDescription>{t.loginSubtitle}</CardDescription>
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
                  <Label htmlFor="password">{t.passwordLabel}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>

                <Button type="submit" disabled={loading} className="h-11 w-full text-base">
                  {loading ? t.loginButtonLoading : t.loginButton}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href={registerHref} className="font-semibold text-foreground underline underline-offset-4 transition hover:text-muted-foreground">
              {t.toRegister}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export function LoginPageContent({ locale }: { locale: Locale }) {
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
      <LoginForm locale={locale} />
    </Suspense>
  );
}

export default function LoginPage() {
  return <LoginPageContent locale="en" />;
}
