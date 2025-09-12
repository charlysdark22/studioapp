'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createTaskAction, getSuggestedKeywordsAction } from '@/app/actions';
import { Keyword } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : 'Add Task'}
    </Button>
  );
}

export function AddTaskForm({ allKeywords }: { allKeywords: Keyword[] }) {
  const [title, setTitle] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (title.length < 3) {
      setSuggestedKeywords([]);
      return;
    }

    const timer = setTimeout(() => {
      startSuggestionTransition(async () => {
        const result = await getSuggestedKeywordsAction(title);
        // Filter out keywords that are already selected
        const newSuggestions = result.keywords.filter(k => !selectedKeywords.includes(k));
        setSuggestedKeywords(newSuggestions);
      });
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [title, selectedKeywords]);

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };
  
  const handleAction = async (formData: FormData) => {
    // Manually append selected keywords to form data
    selectedKeywords.forEach(keyword => {
        formData.append('keywords', keyword);
    });
      
    await createTaskAction(formData);

    // Reset form on success
    formRef.current?.reset();
    setTitle('');
    setSelectedKeywords([]);
    setSuggestedKeywords([]);
    toast({
        title: "Task created!",
        description: "Your new task has been added to the list.",
    });
  }

  return (
    <Card>
      <form action={handleAction} ref={formRef}>
        <CardContent className="p-4 space-y-4">
          <Input
            name="title"
            placeholder="e.g., Water the plants"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoComplete='off'
          />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Keywords</h4>
            
            {/* AI Suggested Keywords */}
            {(isSuggesting || suggestedKeywords.length > 0) && (
              <div className='p-2 border border-dashed rounded-lg'>
                <h5 className="text-xs font-semibold mb-2 flex items-center gap-1">
                  ✨ AI Suggestions {isSuggesting && <Loader2 className="h-3 w-3 animate-spin" />}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords.map(keyword => (
                    <button type="button" key={keyword} onClick={() => handleKeywordToggle(keyword)}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent/20">
                        <Plus className="mr-1 h-3 w-3" /> {keyword}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Selected Keywords */}
            {selectedKeywords.length > 0 && (
               <div className="flex flex-wrap gap-2">
                  {selectedKeywords.map(keyword => (
                     <button type="button" key={keyword} onClick={() => handleKeywordToggle(keyword)}>
                        <Badge variant="default" className="cursor-pointer bg-primary/80 hover:bg-primary">
                          {keyword} <X className="ml-1 h-3 w-3" />
                        </Badge>
                     </button>
                  ))}
                </div>
            )}

            {/* Keyword List */}
            <ScrollArea className="h-32">
                <div className="flex flex-wrap gap-2 p-1">
                {allKeywords.filter(k => !selectedKeywords.includes(k.name)).map(keyword => (
                    <button type="button" key={keyword.id} onClick={() => handleKeywordToggle(keyword.name)}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/60">
                            {keyword.name}
                        </Badge>
                    </button>
                ))}
                </div>
            </ScrollArea>
          </div>

        </CardContent>
        <CardFooter className="p-4 pt-0">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
