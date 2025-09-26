'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, User, PieChart, BarChart, LogOut, Building, ShoppingCart, DollarSign, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MainHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/agence', icon: Building, label: 'Agence' },
    { href: '/projetos', icon: Briefcase, label: 'Projetos' },
    { href: '/administrativo', icon: User, label: 'Administrativo' },
    { href: '/performance', icon: ShoppingCart, label: 'Comercial' },
    { href: '/financeiro', icon: DollarSign, label: 'Financeiro' },
    { href: '/usuario', icon: User, label: 'Usuário' },
    { href: '/login', icon: LogOut, label: 'Sair' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Boa tarde, [Usuario]. Você está em</p>
            <nav className="flex items-center gap-4 mt-2">
              <Link href="/" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600">
                <Home size={16} /> Início
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
            </nav>
          </div>
          <div className="text-2xl font-bold text-gray-700">
            Agence
          </div>
        </div>
      </div>
    </header>
  );
}
