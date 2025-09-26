'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, User, LogOut, Building, ShoppingCart, DollarSign, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

export default function MainHeader() {
  const pathname = usePathname();
  const { language, toggleLanguage, translations } = useLanguage();

  const navLinks = [
    { href: '/agence', icon: Building, label: translations.mainHeader.agence },
    { href: '/projetos', icon: Briefcase, label: translations.mainHeader.projetos },
    { href: '/administrativo', icon: User, label: translations.mainHeader.administrativo },
    { href: '/performance', icon: ShoppingCart, label: translations.mainHeader.comercial },
    { href: '/financeiro', icon: DollarSign, label: translations.mainHeader.financeiro },
    { href: '/usuario', icon: User, label: translations.mainHeader.usuario },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">{translations.mainHeader.welcomeMessage}</p>
            <nav className="flex items-center gap-4 mt-2">
              <Link href="/" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600">
                <Home size={16} /> {translations.mainHeader.inicio}
              </Link>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 text-sm hover:text-blue-600",
                    pathname === link.href ? "text-blue-600 font-bold" : "text-gray-700"
                  )}
                >
                  <link.icon size={16} /> {link.label}
                </Link>
              ))}
               <Link href="/login" className={cn("flex items-center gap-1 text-sm hover:text-blue-600", pathname === "/login" ? "text-blue-600 font-bold" : "text-gray-700")}>
                  <LogOut size={16} /> {translations.mainHeader.sair}
              </Link>
            </nav>
          </div>
          <div className='flex items-center gap-4'>
            <button
                onClick={toggleLanguage}
                className="border rounded-md px-3 py-1 text-sm font-medium hover:bg-gray-100"
            >
                {language === 'pt' ? 'ES' : 'PT'}
            </button>
            <div className="text-2xl font-bold text-gray-700">
                Agence
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
