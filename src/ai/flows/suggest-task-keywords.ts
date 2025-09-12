'use server';

/**
 * @fileOverview Suggests relevant keywords for a given task title using GenAI.
 *
 * - suggestTaskKeywords - A function that suggests keywords for a task title.
 * - SuggestTaskKeywordsInput - The input type for the suggestTaskKeywords function.
 * - SuggestTaskKeywordsOutput - The return type for the suggestTaskKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskKeywordsInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
});
export type SuggestTaskKeywordsInput = z.infer<typeof SuggestTaskKeywordsInputSchema>;

const SuggestTaskKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('An array of keywords relevant to the task title.'),
});
export type SuggestTaskKeywordsOutput = z.infer<typeof SuggestTaskKeywordsOutputSchema>;

export async function suggestTaskKeywords(input: SuggestTaskKeywordsInput): Promise<SuggestTaskKeywordsOutput> {
  return suggestTaskKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskKeywordsPrompt',
  input: {schema: SuggestTaskKeywordsInputSchema},
  output: {schema: SuggestTaskKeywordsOutputSchema},
  prompt: `Suggest relevant keywords for the following task title:

Task Title: {{{taskTitle}}}

Keywords:`, // The model will generate keywords based on the task title.
});

const suggestTaskKeywordsFlow = ai.defineFlow(
  {
    name: 'suggestTaskKeywordsFlow',
    inputSchema: SuggestTaskKeywordsInputSchema,
    outputSchema: SuggestTaskKeywordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
