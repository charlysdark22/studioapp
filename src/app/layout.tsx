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
  // El RootLayout renderiza la estructura principal. 
  // LanguageProvider se encargará de modificar el 'lang' del document en el cliente.
  return (
    <html lang="en"> 
      <body className={`${inter.className} bg-gray-100`}>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
