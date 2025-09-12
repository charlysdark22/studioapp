export type Keyword = {
  id: number;
  name: string;
};

export type Task = {
  id: number;
  title: string;
  is_done: boolean;
  keywords: Keyword[];
};
