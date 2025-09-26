'use server';
/**
 * @fileOverview Simulates sending a verification code to a user's email.
 *
 * - sendVerificationCode - A function that simulates sending a code.
 * - VerificationInput - The input type for the function.
 * - VerificationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VerificationInputSchema = z.object({
  email: z.string().email().describe('The email address to send the code to.'),
});
export type VerificationInput = z.infer<typeof VerificationInputSchema>;

const VerificationOutputSchema = z.object({
  email: z.string().email(),
  verificationCode: z.string().length(6),
  status: z.enum(['success', 'failure']),
});
export type VerificationOutput = z.infer<typeof VerificationOutputSchema>;

export async function sendVerificationCode(
  input: VerificationInput
): Promise<VerificationOutput> {
  return sendVerificationCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verificationCodePrompt',
  input: { schema: VerificationInputSchema },
  output: { schema: VerificationOutputSchema },
  prompt: `You are a user registration system. A new user has signed up with the email {{{email}}}. 
  
  Your task is to generate a 6-digit verification code for them.
  
  Simulate the process of sending an email by returning the user's email, the generated code, and a 'success' status.`,
});

const sendVerificationCodeFlow = ai.defineFlow(
  {
    name: 'sendVerificationCodeFlow',
    inputSchema: VerificationInputSchema,
    outputSchema: VerificationOutputSchema,
  },
  async (input) => {
    // In a real app, you would integrate with an email service provider here.
    // For this simulation, we let Genkit generate a code and confirm.
    console.log(`Simulating sending verification code to ${input.email}...`);

    const { output } = await prompt(input);
    
    // For simulation purposes, we can log the code.
    // In a real app, DO NOT log sensitive info like this.
    console.log(`Generated code for ${input.email}: ${output?.verificationCode}`);

    if (!output) {
      return { email: input.email, verificationCode: '', status: 'failure' };
    }

    return output;
  }
);
