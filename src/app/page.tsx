'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/language-context';


export default function LandingPage() {
  const { translations } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-700">
            Agence
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/performance" passHref>
              <Button variant="outline">{translations.landingPage.performancePanel}</Button>
            </Link>
            <Link href="/login" passHref>
              <Button>{translations.landingPage.login}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {translations.landingPage.welcomeTitle}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {translations.landingPage.welcomeSubtitle}
          </p>
          <Link href="/performance" passHref>
             <Button size="lg">
              {translations.landingPage.accessPanel} <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      <footer className="bg-white py-6">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Agence. {translations.landingPage.footerRights}</p>
        </div>
      </footer>
    </div>
  );
}
