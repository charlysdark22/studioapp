'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { sendVerificationCode } from '@/ai/flows/send-verification-code';
import { useState } from 'react';
import { useLanguage } from '@/context/language-context';


const formSchemaPt = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z
    .string()
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

const formSchemaEs = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, ingrese un email válido.' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});


export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { language, translations } = useLanguage();
  
  const formSchema = language === 'pt' ? formSchemaPt : formSchemaEs;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await sendVerificationCode({ email: values.email });

      toast({
        title: translations.registerPage.toastSuccessTitle,
        description: `${translations.registerPage.toastSuccessDescription} ${result.email}.`,
      });

      router.push(`/verify?email=${encodeURIComponent(result.email)}`);
    } catch (error) {
      console.error(error);
      toast({
        title: translations.registerPage.toastErrorTitle,
        description: translations.registerPage.toastErrorDescription,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{translations.registerPage.title}</CardTitle>
          <CardDescription>
            {translations.registerPage.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.registerPage.nameLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={translations.registerPage.namePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.registerPage.passwordLabel}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? translations.registerPage.loadingButton : translations.registerPage.submitButton}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {translations.registerPage.alreadyHaveAccount}{' '}
            <Link href="/login" className="underline">
              {translations.registerPage.loginLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
