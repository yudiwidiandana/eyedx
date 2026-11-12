"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { translations, type Locale } from "../lib/translations";
import { useAuth } from "../lib/useAuth";
import { Button } from "@/components/ui/button";

export default function Header({ locale }: { locale: Locale }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const t = translations[locale].nav;

  const path = (segment: string) =>
    `/${locale === "en" ? segment : [locale, segment].filter(Boolean).join("/")}`;

  const isActive = (href: string) => pathname === href;

  const navLinkClass = (href: string, extra = "") =>
    `${extra} font-medium transition-colors ${
      isActive(href)
        ? "font-semibold text-foreground underline decoration-2 underline-offset-4"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const navLinks = [
    { href: path(""), label: t.home },
    { href: path("diagnosis"), label: t.diagnosis },
    { href: path("about"), label: t.about },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="container mx-auto px-6 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-3">
          <Link href={path("")} className="text-xl font-bold text-foreground">
            EyeDx
          </Link>

          <div className="flex items-center gap-4">
            <ul className="hidden items-center gap-7 md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={navLinkClass(link.href)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user && (
                <>
                  <li>
                    <Link
                      href={path("profile")}
                      aria-current={isActive(path("profile")) ? "page" : undefined}
                      className={navLinkClass(path("profile"))}
                    >
                      Profile
                    </Link>
                  </li>
                  {(user.role === "admin" || user.role === "expert") && (
                    <li>
                      <Link
                        href={path("admin")}
                        aria-current={isActive(path("admin")) ? "page" : undefined}
                        className={navLinkClass(path("admin"))}
                      >
                        Admin
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>

            <div className="hidden h-5 w-px bg-border md:block" />

            <div className="flex items-center gap-2">
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex"
                  onClick={logout}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  render={<Link href={path("login")} />}
                  nativeButton={false}
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  Login
                </Button>
              )}

              <LanguageSwitcher locale={locale} />

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen((value) => !value)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mt-4 border-t border-border pt-4 md:hidden">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={navLinkClass(link.href, "block")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user && (
                <>
                  <li>
                    <Link
                      href={path("profile")}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isActive(path("profile")) ? "page" : undefined}
                      className={navLinkClass(path("profile"), "block")}
                    >
                      Profile
                    </Link>
                  </li>
                  {(user.role === "admin" || user.role === "expert") && (
                    <li>
                      <Link
                        href={path("admin")}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={isActive(path("admin")) ? "page" : undefined}
                        className={navLinkClass(path("admin"), "block")}
                      >
                        Admin
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>

            <div className="mt-4 border-t border-border pt-4">
              {user ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  render={<Link href={path("login")} onClick={() => setIsMenuOpen(false)} />}
                  nativeButton={false}
                  className="w-full"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
