'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useLanguage } from '@/context/language-context';

const formSchemaPt = z.object({
  code: z
    .string()
    .min(6, { message: 'O código deve ter 6 dígitos.' })
    .max(6, { message: 'O código deve ter 6 dígitos.' }),
});

const formSchemaEs = z.object({
  code: z
    .string()
    .min(6, { message: 'El código debe tener 6 dígitos.' })
    .max(6, { message: 'El código debe tener 6 dígitos.' }),
});

const SIMULATED_CORRECT_CODE = "123456";

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { language, translations } = useLanguage();

  const formSchema = language === 'pt' ? formSchemaPt : formSchemaEs;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-2xl">{translations.verifyPage.errorTitle}</CardTitle>
            <CardDescription>
              {translations.verifyPage.errorDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/register">
              <Button variant="outline">{translations.verifyPage.backToRegister}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(`Verificando código para ${email} con el código ${values.code}`);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (values.code === SIMULATED_CORRECT_CODE) {
      toast({
        title: translations.verifyPage.toastSuccessTitle,
        description: translations.verifyPage.toastSuccessDescription,
      });
      router.push('/login');
    } else {
      toast({
        title: translations.verifyPage.toastErrorTitle,
        description: translations.verifyPage.toastErrorDescription,
        variant: 'destructive',
      });
      form.setError("code", { message: translations.verifyPage.toastInvalidCode });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{translations.verifyPage.title}</CardTitle>
          <CardDescription>
            {translations.verifyPage.description(email)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.verifyPage.codeLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? translations.verifyPage.loadingButton : translations.verifyPage.submitButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  const { translations } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>{translations.verifyPage.loadingFallback}</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyPageContent />
    </Suspense>
  );
}