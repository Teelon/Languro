"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Lock, Book } from "lucide-react";
import { toast } from "sonner";
import {
  fetchUserLists,
  createUserList,
  addVerbToBeList,
  fetchLanguages,
  UserList,
  Language
} from "../services/userLists";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AddToListSheetContentProps {
  verb: string;
  language: string;
  context?: string | null;
  onClose: () => void;
}

export function AddToListSheetContent({ verb, language, context, onClose }: AddToListSheetContentProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [lists, setLists] = useState<UserList[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);

  // Create List State
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedNewListLangId, setSelectedNewListLangId] = useState<string | null>(null);
  const [creatingLoading, setCreatingLoading] = useState(false);

  // Add State
  const [addingToListId, setAddingToListId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listsData, langsData] = await Promise.all([
        fetchUserLists(),
        fetchLanguages()
      ]);
      setLists(listsData);
      setAvailableLanguages(langsData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load lists");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    // Determine language ID
    let finalLangId = selectedNewListLangId ? parseInt(selectedNewListLangId) : null;

    if (!finalLangId && availableLanguages.length > 0) {
      // Try to find by ISO code from props
      const found = availableLanguages.find(l => l.iso_code === language);
      if (found) finalLangId = found.id;
    }

    if (!finalLangId) {
      toast.error("Please select a language for the list.");
      return;
    }

    setCreatingLoading(true);
    try {
      const newList = await createUserList({
        name: newListName,
        languageId: finalLangId
      });
      setLists([newList, ...lists]);
      setNewListName("");
      setIsCreating(false);
      toast.success(`List "${newList.name}" created`);

      // Immediately add the verb to the new list
      await handleAdd(newList.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to create list");
    } finally {
      setCreatingLoading(false);
    }
  };

  const handleAdd = async (listId: string) => {
    setAddingToListId(listId);
    try {
      await addVerbToBeList(listId, verb, language, context);
      toast.success(`"${verb}" added to list`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add to list");
    } finally {
      setAddingToListId(null);
    }
  };

  // Unauthenticated View
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
        <div className="bg-muted p-4 rounded-full">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Login Required</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            You need to be logged in to save words to your personal lists.
          </p>
        </div>
        <div className="flex flex-col w-full max-w-xs gap-3">
          <Button onClick={() => signIn()} className="w-full">
            Log In
          </Button>
          <Button variant="outline" onClick={() => router.push('/signup')} className="w-full">
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Book className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Save to List</h2>
          <p className="text-sm text-muted-foreground">Save <span className="font-medium text-foreground">"{verb}"</span> to review later</p>
        </div>
      </div>

      {loading && lists.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {isCreating ? (
            <div className="bg-muted/50 p-4 rounded-xl border space-y-4 mb-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">List Name</label>
                <Input
                  placeholder="e.g. Travel Vocabulary"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateList();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Language</label>
                <Select
                  value={selectedNewListLangId || ""}
                  onValueChange={setSelectedNewListLangId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map(l => (
                      <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || creatingLoading}
                  className="flex-1"
                >
                  {creatingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create & Save
                </Button>
                <Button variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start h-12 mb-4 border-dashed"
              onClick={() => {
                // Pre-select language if found
                const found = availableLanguages.find(l => l.iso_code === language);
                if (found) setSelectedNewListLangId(found.id.toString());
                setIsCreating(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New List
            </Button>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {lists.length === 0 && !isCreating && (
              <div className="text-center py-10 text-muted-foreground">
                <p>No lists found. Create one to get started!</p>
              </div>
            )}

            {lists.map(list => {
              const isMatching = list.language?.iso_code === language;
              return (
                <button
                  key={list.id}
                  onClick={() => handleAdd(list.id)}
                  disabled={addingToListId !== null}
                  className="w-full flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{list.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {list.language && (
                        <span className={`px-1.5 py-0.5 rounded ${isMatching ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {list.language.name}
                        </span>
                      )}
                      <span>•</span>
                      <span>{list._count?.items || 0} items</span>
                    </div>
                  </div>

                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {addingToListId === list.id ? (
                      <Loader2 className="h-5 w-5 animate-spin opacity-100" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
