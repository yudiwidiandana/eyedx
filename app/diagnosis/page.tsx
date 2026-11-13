"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";
import { useAuth } from "../lib/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DiagnosisPageContent({ locale }: { locale: Locale }) {
  const t = translations[locale].diagnosisPage;
  const router = useRouter();
  const { user, loading } = useAuth();

  const genderLabels: Record<string, string> = {
    "laki-laki": t.genderMale,
    perempuan: t.genderFemale,
    lainnya: t.genderOther,
  };

  const profileIncomplete = !loading && (!user || !user.age || !user.gender);

  const handleNext = () => {
    if (!user || !user.age || !user.gender) return;

    router.push(`/${locale === "en" ? "" : locale + "/"}questionnaire`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pt-8">
      <Header locale={locale} />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-12">
        <Card className="mx-auto max-w-4xl">
          <CardContent>
            <h1 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">{t.title}</h1>

            {profileIncomplete ? (
              <Alert variant="destructive" className="mb-8">
                <AlertDescription>{t.profileIncomplete}</AlertDescription>
              </Alert>
            ) : (
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{t.nameLabel}</p>
                  <p className="text-lg text-foreground">{user!.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{t.ageLabel}</p>
                  <p className="text-lg text-foreground">{user!.age}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{t.genderLabel}</p>
                  <p className="text-lg text-foreground">
                    {genderLabels[user!.gender as string] ?? user!.gender}
                  </p>
                </div>
              </div>
            )}

            <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{t.description}</p>
          </CardContent>
        </Card>

        <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            render={<Link href={`/${locale === "en" ? "" : locale}`} />}
            nativeButton={false}
            className="h-11 w-full sm:w-auto"
          >
            {t.backButton}
          </Button>
          <Button onClick={handleNext} disabled={profileIncomplete} className="h-11 w-full sm:w-auto">
            {t.nextButton}
          </Button>
        </div>

        <p className="mx-auto mt-4 max-w-4xl text-sm italic text-muted-foreground">
          {t.disclaimer}
        </p>
      </main>
    </div>
  );
}

export default function DiagnosisPage() {
  return <DiagnosisPageContent locale="en" />;
}
