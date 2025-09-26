'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/language-context';

export default function LoginPage() {
  const { translations } = useLanguage();

  const handleLogin = () => {
    console.log('Iniciando sesión...');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{translations.loginPage.title}</CardTitle>
          <CardDescription>
            {translations.loginPage.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@exemplo.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{translations.loginPage.password}</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="button" onClick={handleLogin} className="w-full">
            {translations.loginPage.loginButton}
          </Button>
          <div className="mt-4 text-center text-sm">
            {translations.loginPage.noAccount}{' '}
            <Link href="/register" className="underline">
              {translations.loginPage.registerLink}
            </Link>
          </div>
           <div className="mt-2 text-center text-sm">
            <Link href="/" className="underline">
              {translations.loginPage.backToHome}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
