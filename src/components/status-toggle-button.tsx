'use client';

import { useFormStatus } from 'react-dom';
import { Check, Loader2 } from 'lucide-react';
import { toggleTaskStatusAction } from '@/app/actions';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

function SubmitButton({ isDone }: { isDone: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      className={cn(
        'h-6 w-6 rounded-full border-2 transition-all',
        isDone
          ? 'border-accent bg-accent text-accent-foreground'
          : 'border-muted-foreground/50 hover:border-accent',
        pending && 'animate-spin'
      )}
      aria-label={isDone ? 'Mark task as pending' : 'Mark task as completed'}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-3 w-3" />
      ) : (
        isDone && <Check className="h-4 w-4" />
      )}
    </Button>
  );
}

export function StatusToggleButton({ task }: { task: Task }) {
  return (
    <form action={toggleTaskStatusAction}>
      <input type="hidden" name="taskId" value={task.id} />
      <SubmitButton isDone={task.is_done} />
    </form>
  );
}
