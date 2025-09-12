import type { Task, Keyword } from './types';

// In-memory data store
let tasks: Omit<Task, 'keywords'>[] = [
  { id: 1, title: 'Set up project structure', is_done: true },
  { id: 2, title: 'Design the UI layout', is_done: true },
  { id: 3, title: 'Implement task creation feature', is_done: false },
  { id: 4, title: 'Develop status toggle functionality', is_done: false },
  { id: 5, title: 'Integrate AI keyword suggestions', is_done: false },
];

let keywords: Keyword[] = [
  { id: 1, name: 'development' },
  { id: 2, name: 'design' },
  { id: 3, name: 'planning' },
  { id: 4, name: 'AI' },
  { id: 5, name: 'frontend' },
];

let task_keyword: { taskId: number; keywordId: number }[] = [
  { taskId: 1, keywordId: 1 },
  { taskId: 1, keywordId: 3 },
  { taskId: 2, keywordId: 2 },
  { taskId: 3, keywordId: 1 },
  { taskId: 3, keywordId: 5 },
  { taskId: 4, keywordId: 1 },
  { taskId: 4, keywordId: 5 },
  { taskId: 5, keywordId: 4 },
];

// Data access functions
export async function getKeywords(): Promise<Keyword[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));
  return keywords;
}

export async function getTasks(): Promise<Task[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return tasks.map(task => ({
    ...task,
    keywords: task_keyword
      .filter(tk => tk.taskId === task.id)
      .map(tk => keywords.find(k => k.id === tk.keywordId)!)
      .filter(Boolean), // Filter out undefined if a keyword is not found
  })).sort((a, b) => a.id - b.id);
}

export async function getTask(id: number): Promise<Task | undefined> {
  const task = tasks.find(t => t.id === id);
  if (!task) return undefined;
  
  return {
    ...task,
    keywords: task_keyword
      .filter(tk => tk.taskId === task.id)
      .map(tk => keywords.find(k => k.id === tk.keywordId)!)
      .filter(Boolean),
  };
}


export async function toggleTaskStatus(id: number): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }
  tasks[taskIndex].is_done = !tasks[taskIndex].is_done;
  
  const updatedTask = tasks[taskIndex];
  
  return {
    ...updatedTask,
    keywords: task_keyword
      .filter(tk => tk.taskId === updatedTask.id)
      .map(tk => keywords.find(k => k.id === tk.keywordId)!)
      .filter(Boolean),
  };
}

export async function createTask(title: string, keywordIds: number[]): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newId = (tasks.at(-1)?.id ?? 0) + 1;
  
  const newTask = {
    id: newId,
    title,
    is_done: false,
  };
  tasks.push(newTask);

  keywordIds.forEach(keywordId => {
    task_keyword.push({ taskId: newId, keywordId });
  });

  return {
    ...newTask,
    keywords: keywordIds
      .map(id => keywords.find(k => k.id === id)!)
      .filter(Boolean),
  };
}

export async function findOrCreateKeywords(keywordNames: string[]): Promise<Keyword[]> {
    await new Promise(resolve => setTimeout(resolve, 50));

    const createdOrFoundKeywords: Keyword[] = [];

    for (const name of keywordNames) {
        let keyword = keywords.find(k => k.name.toLowerCase() === name.toLowerCase());

        if (!keyword) {
            const newId = (keywords.at(-1)?.id ?? 0) + 1;
            keyword = { id: newId, name: name.toLowerCase() };
            keywords.push(keyword);
        }
        createdOrFoundKeywords.push(keyword);
    }

    return createdOrFoundKeywords;
}
