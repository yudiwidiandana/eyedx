"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DiagnosisPageContent({ locale }: { locale: Locale }) {
  const t = translations[locale].diagnosisPage;
  const router = useRouter();

  const genderLabels: Record<string, string> = {
    "laki-laki": t.genderMale,
    perempuan: t.genderFemale,
    lainnya: t.genderOther,
  };

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<{ name?: string; age?: string; gender?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; age?: string; gender?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!age || parseInt(age) <= 0 || parseInt(age) > 150) {
      newErrors.age = "Valid age is required";
    }

    if (!gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      const params = new URLSearchParams({
        name: name.trim(),
        age: age,
        gender: gender,
      });
      router.push(`/${locale === "en" ? "" : locale + "/"}questionnaire?${params.toString()}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pt-8">
      <Header locale={locale} />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-12">
        <Card className="mx-auto max-w-4xl">
          <CardContent>
            <h1 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">{t.title}</h1>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">{t.nameLabel}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  className="h-11"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">{t.ageLabel}</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder={t.agePlaceholder}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  aria-invalid={!!errors.age}
                  className="h-11"
                />
                {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t.genderLabel}</Label>
                <Select value={gender} onValueChange={(value) => setGender(value ?? "")}>
                  <SelectTrigger id="gender" className="h-11 w-full" aria-invalid={!!errors.gender}>
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
                {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
              </div>
            </div>

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
          <Button onClick={handleNext} className="h-11 w-full sm:w-auto">
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
