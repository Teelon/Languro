"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { fetchUserLists, createUserList, UserList, fetchLanguages, Language } from '@/features/user-lists/services/userLists';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { DrillSetupModal } from '@/components/drill/DrillSetupModal';
import { Plus, Loader2, BookOpen, MoreVertical, Globe, Sparkles, Play } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

export default function UserListsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lists, setLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Creation Form State
  const [newListName, setNewListName] = useState("");
  const [selectedLangId, setSelectedLangId] = useState<string>("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listsData, langsData] = await Promise.all([
        fetchUserLists(),
        fetchLanguages()
      ]);
      setLists(listsData);
      setLanguages(langsData);
      // Default to first language if available
      if (langsData.length > 0) {
        setSelectedLangId(langsData[0].id.toString());
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newListName.trim() || !selectedLangId) return;
    try {
      const langId = parseInt(selectedLangId);
      const newList = await createUserList({
        name: newListName,
        languageId: langId
      });
      setLists([newList, ...lists]);
      setNewListName("");
      setIsCreating(false);
      toast.success("List created successfully");
    } catch (error) {
      toast.error("Failed to create list");
    }
  };

  if (status === 'loading') return null;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Please log in</h2>
        <p className="text-muted-foreground">You need an account to manage your vocabulary lists.</p>
        <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            My Collections
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Curate your personal vocabulary decks and master new languages through targeted practice.
          </p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
              <Plus className="mr-2 h-5 w-5" /> Create New List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-primary/20 backdrop-blur-md bg-background/95">
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
              <DialogDescription>
                Give your list a memorable name and choose a target language.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="name"
                  placeholder="e.g., Summer in Paris, Business Verbs"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="col-span-3"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Select value={selectedLangId} onValueChange={setSelectedLangId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.id} value={lang.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!newListName.trim() || !selectedLangId} className="bg-gradient-to-r from-primary to-primary/80">
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setIsCreating(true)}>
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-sm">
            Start your journey by creating your first vocabulary list. You can add verbs from the conjugation tool.
          </p>
          <Button variant="secondary">Create your first list</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map(list => (
            <Card key={list.id} className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 transition-colors border-primary/20 text-primary">
                      {list.language?.name || 'Unknown'}
                    </Badge>
                    {list._count?.items === 0 && (
                      <Badge variant="secondary" className="text-xs font-normal opacity-70">
                        New
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/lists/${list.id}`);
                  }}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="pt-3 text-xl font-bold truncate pr-2 group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/lists/${list.id}`)}>
                  {list.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="pb-4 relative z-10 cursor-pointer" onClick={() => router.push(`/lists/${list.id}`)}>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground/80">
                  <div className="flex items-center justify-between">
                    <span>{list._count?.items || 0} verbs</span>
                    <span className="text-xs opacity-70">Updated {format(new Date(list.updatedAt || Date.now()), 'MMM d')}</span>
                  </div>
                  {list.description && <p className="truncate mt-2 text-xs opacity-70 border-t pt-2 mt-2">{list.description}</p>}
                </div>
              </CardContent>

              <CardFooter className="pt-0 relative z-10 gap-3">
                <Button className="flex-1 bg-secondary/50 hover:bg-secondary text-secondary-foreground" variant="secondary" onClick={() => router.push(`/lists/${list.id}`)}>
                  Manage
                </Button>
                <div className="flex-1">
                  <DrillSetupModal listId={list.id} trigger={
                    <Button className="w-full bg-gradient-to-r from-red-600/90 to-red-500/90 hover:from-red-600 hover:to-red-500 shadow-sm border-0">
                      <Play className="mr-2 h-3.5 w-3.5 fill-current" /> Start Drill
                    </Button>
                  } />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
