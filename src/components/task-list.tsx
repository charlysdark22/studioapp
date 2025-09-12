import { Task } from '@/lib/types';
import { TaskItem } from '@/components/task-item';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed border-border text-muted-foreground">
        <p>No tasks here. Well done!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-grow space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
