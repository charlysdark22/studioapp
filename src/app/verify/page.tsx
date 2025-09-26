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

const formSchema = z.object({
  code: z
    .string()
    .min(6, { message: 'El código debe tener 6 dígitos.' })
    .max(6, { message: 'El código debe tener 6 dígitos.' }),
});

// Este es el código que el flujo de Genkit "generaría".
// En una aplicación real, se obtendría de la sesión o de una base de datos.
const SIMULATED_CORRECT_CODE = "123456";

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!email) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-sm text-center">
                 <CardHeader>
                    <CardTitle className="text-2xl">Error</CardTitle>
                    <CardDescription>
                        No fue posible encontrar el e-mail para verificación.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/register">
                        <Button variant="outline">Voltar ao Registro</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(`Verificando código para ${email} con el código ${values.code}`);

    // Simula un retardo de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aquí es donde harías una llamada al backend para verificar el código.
    // Para esta simulación, lo comparamos con un valor estático.
    if (values.code === SIMULATED_CORRECT_CODE) {
      toast({
        title: '¡Cuenta Verificada!',
        description: 'Su cuenta ha sido verificada con éxito. Ahora puede iniciar sesión.',
      });
      router.push('/login');
    } else {
      toast({
        title: 'Código Inválido',
        description: 'El código de verificación es incorrecto. Por favor, intente de nuevo.',
        variant: 'destructive',
      });
      form.setError("code", { message: "Código incorrecto." });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verifique sua Conta</CardTitle>
          <CardDescription>
            Enviamos um código de 6 dígitos para {email}. Insira-o abaixo. (Dica: é 123456)
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
                    <FormLabel>Código de Verificação</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verificando...' : 'Verificar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <VerifyPageContent />
        </Suspense>
    )
}