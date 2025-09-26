import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/language-context";

const inter = Inter({ subsets: ["latin"] });

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
    // The <html> and <body> tags are managed by Next.js, but we can wrap the children
    // with our client-side provider. The provider will then handle dynamic attributes on the body.
    <LanguageProvider>
        <html lang="en">
            <body className={`${inter.className} bg-gray-100`}>
                {children}
                <Toaster />
            </body>
        </html>
    </LanguageProvider>
  );
}
