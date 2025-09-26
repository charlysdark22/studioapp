'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider, useLanguage } from "@/context/language-context";

const inter = Inter({ subsets: ["latin"] });

// Metadata sigue funcionando en un componente cliente raíz
export const metadata: Metadata = {
  title: "Painel de Desempenho de Consultores",
  description: "Painel de desempenho de consultores da Agence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // El proveedor de idioma necesita estar dentro del layout que es cliente
    <LanguageProvider>
        <ClientBody>{children}</ClientBody>
    </LanguageProvider>
  );
}

// Componente auxiliar para acceder al contexto del idioma para la etiqueta html
function ClientBody({ children }: { children: React.ReactNode }) {
    const { language } = useLanguage();
    return (
        <html lang={language}>
            <body className={`${inter.className} bg-gray-100`}>
                {children}
                <Toaster />
            </body>
        </html>
    )
}
