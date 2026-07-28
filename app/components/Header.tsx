"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-200 dark:bg-zinc-900/95 dark:border-zinc-800">
      <nav className="container mx-auto px-6 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
            EyeDx
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <Link
                href="/"
                className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors font-medium"
              >
                Beranda
              </Link>
            </li>
            <li>
              <Link
                href="/diagnosis"
                className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors font-medium"
              >
                Diagnosis
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors font-medium"
              >
                About
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-zinc-700 dark:text-zinc-300"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <ul className="md:hidden mt-4 pb-4 space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <li>
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors font-medium"
              >
                Beranda
              </Link>
            </li>
            <li>
              <Link
                href="/diagnosis"
                onClick={() => setIsMenuOpen(false)}
                className="block text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors font-medium"
              >
                Diagnosis
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="block text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors font-medium"
              >
                About
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
