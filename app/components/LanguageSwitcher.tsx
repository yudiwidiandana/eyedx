"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { locales, type Locale, translations } from "../lib/translations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    const segments = pathname.split("/").filter(Boolean);
    const [currentLocale, ...rest] = segments;

    const nextPath =
      currentLocale && locales.includes(currentLocale as Locale)
        ? `/${[nextLocale, ...rest].join("/")}`
        : `/${[nextLocale, ...segments].join("/")}`;

    router.push(nextPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={translations[locale].language.switcherHint}
          >
            <Globe />
            {locale === "en" ? "EN" : "ID"}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {locales.map((option) => (
          <DropdownMenuItem key={option} onClick={() => handleChange(option)}>
            <span className="flex-1">
              {option === "en" ? "English" : "Bahasa Indonesia"}
            </span>
            <span className="text-muted-foreground">
              {option === "en" ? "EN" : "ID"}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
