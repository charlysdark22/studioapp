import { Suspense } from 'react';
import { getTasks, getKeywords } from '@/lib/data';
import { AddTaskForm } from '@/components/add-task-form';
import { TaskList, TaskListSkeleton } from '@/components/task-list';
import { CheckCircle2, ListTodo } from 'lucide-react';

export default async function Home() {
  const tasks = await getTasks();
  const keywords = await getKeywords();

  const pendingTasks = tasks.filter(task => !task.is_done);
  const completedTasks = tasks.filter(task => task.is_done);

  return (
    <main className="min-h-screen bg-background font-body text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 flex items-center gap-3">
          <div className="bg-primary/20 text-primary p-3 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-check"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            TaskFlow
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <AddTaskForm allKeywords={keywords} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <ListTodo className="text-accent" />
                Pending Tasks
              </h2>
              <Suspense fallback={<TaskListSkeleton />}>
                <TaskList tasks={pendingTasks} />
              </Suspense>
            </div>
            <div>
               <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <CheckCircle2 className="text-green-500" />
                Completed Tasks
              </h2>
               <Suspense fallback={<TaskListSkeleton />}>
                <TaskList tasks={completedTasks} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
