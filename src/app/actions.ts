'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createTask, findOrCreateKeywords, toggleTaskStatus } from '@/lib/data';
import { suggestTaskKeywords } from '@/ai/flows/suggest-task-keywords';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  keywords: z.array(z.string()).optional(),
});

export async function createTaskAction(formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    keywords: formData.getAll('keywords'), // getAll for multiple values with same name
  };

  const parsed = taskSchema.safeParse(rawData);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    return { error: 'Invalid data' };
  }
  
  const { title, keywords: keywordNames } = parsed.data;

  // Find existing keywords or create new ones
  const keywordObjects = await findOrCreateKeywords(keywordNames ?? []);
  const keywordIds = keywordObjects.map(k => k.id);

  await createTask(title, keywordIds);
  revalidatePath('/');
}

export async function toggleTaskStatusAction(formData: FormData) {
  const id = formData.get('taskId');
  if (typeof id !== 'string') {
    throw new Error('Task ID must be a string');
  }
  
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    throw new Error('Invalid Task ID');
  }

  await toggleTaskStatus(taskId);
  revalidatePath('/');
}

export async function getSuggestedKeywordsAction(taskTitle: string) {
  if (!taskTitle) {
    return { keywords: [] };
  }
  try {
    const result = await suggestTaskKeywords({ taskTitle });
    return result;
  } catch (error) {
    console.error('AI suggestion failed:', error);
    return { keywords: [] };
  }
}
