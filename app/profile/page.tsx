"use client";

import { useAuth } from "../lib/useAuth";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";

interface HistoryItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  questionsAsked: number;
  createdAt: string;
}

export function ProfilePageContent({ locale }: { locale: Locale }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const t = translations[locale].profilePage;
  const genderLabels: Record<string, string> = {
    "laki-laki": translations[locale].diagnosisPage.genderMale,
    perempuan: translations[locale].diagnosisPage.genderFemale,
    lainnya: translations[locale].diagnosisPage.genderOther,
  };
  const roleLabels: Record<string, string> = {
    user: t.roleUser,
    expert: t.roleExpert,
    admin: t.roleAdmin,
  };

  const path = useCallback(
    (segment: string) => `/${locale === "en" ? segment : [locale, segment].filter(Boolean).join("/")}`,
    [locale]
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push(path("login"));
    }
  }, [loading, user, router, path]);

  useEffect(() => {
    if (user) {
      fetch("/api/profile/history")
        .then((res) => res.json())
        .then((data) => {
          setHistory(data.history || []);
          setHistoryLoading(false);
        })
        .catch(() => {
          setHistory([]);
          setHistoryLoading(false);
        });
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header locale={locale} />
        <div className="flex flex-1 items-center justify-center">
          <p>{translations[locale].common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <Header locale={locale} />
      <div className="max-w-6xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">{t.nameLabel}:</span> {user.name}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">{t.usernameLabel}:</span> {user.username}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">{t.roleLabel}:</span> {roleLabels[user.role] ?? user.role}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.historyTitle}</h2>

          {historyLoading ? (
            <p className="text-gray-600">{t.historyLoading}</p>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">{t.historyEmpty}</p>
              <Link
                href={path("diagnosis")}
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {t.startDiagnosis}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.colDate}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.colPatient}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.colAge}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.colGender}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.colSymptoms}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.colAction}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.createdAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {genderLabels[item.gender] ?? item.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.questionsAsked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`${path("results")}/${item.id}`}
                          className="text-primary hover:text-primary/80"
                        >
                          {t.viewResult}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfilePageContent locale="en" />;
}
