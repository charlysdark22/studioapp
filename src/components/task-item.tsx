import { Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusToggleButton } from './status-toggle-button';
import { Tag } from 'lucide-react';

export function TaskItem({ task }: { task: Task }) {
  return (
    <Card className={`transition-all hover:shadow-md ${task.is_done ? 'bg-card/60 dark:bg-card/40 opacity-70' : 'bg-card'}`}>
      <CardContent className="p-4 flex items-start gap-4">
        <StatusToggleButton task={task} />
        <div className="flex-grow">
          <p className={`font-medium ${task.is_done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </p>
          {task.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {task.keywords.map(keyword => (
                <Badge key={keyword.id} variant="secondary" className="font-normal">
                  {keyword.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
