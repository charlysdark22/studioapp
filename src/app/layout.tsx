'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider, useLanguage } from "@/context/language-context";

const inter = Inter({ subsets: ["latin"] });

// This metadata object is now statically exported from a Server Component.
export const metadata: Metadata = {
  title: "Painel de Desempenho de Consultores",
  description: "Painel de desempenho de consultores da Agence",
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
        <ClientBody>{children}</ClientBody>
    </LanguageProvider>
  );
}
