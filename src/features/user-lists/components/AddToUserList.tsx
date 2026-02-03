"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListPlus, Plus, Check, Loader2, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { fetchUserLists, createUserList, addVerbToBeList, UserList, fetchLanguages, Language } from "../services/userLists";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AddToUserListProps {
  verb: string;
  language: string; // 'es', 'fr', etc.
  languageId?: number; // Optional, can be derived or fetched if needed, but better passed if known
  minimal?: boolean; // For icon-only version
  context?: string | null;
  children?: React.ReactNode; // Custom trigger
}

export function AddToUserList({ verb, language, languageId, minimal = false, context, children }: AddToUserListProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<UserList[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedNewListLangId, setSelectedNewListLangId] = useState<string | null>(null);

  const [addingToListId, setAddingToListId] = useState<string | null>(null);

  useEffect(() => {
    if (open && session?.user) {
      loadData();
    }
  }, [open, session]);

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
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    // Use provided ID, or selected ID, or find ID from language code
    let effectiveLangId = selectedNewListLangId ? parseInt(selectedNewListLangId) : languageId;

    if (!effectiveLangId && availableLanguages.length > 0) {
      const found = availableLanguages.find(l => l.iso_code === language);
      if (found) effectiveLangId = found.id;
    }

    if (!effectiveLangId) {
      toast.error("Language configuration error: Could not determine list language.");
      return;
    }

    setLoading(true);
    try {
      const newList = await createUserList({
        name: newListName,
        languageId: effectiveLangId
      });
      setLists([newList, ...lists]);
      setNewListName("");
      setCreating(false);
      toast.success(`List "${newListName}" created`);

      // Auto add
      handleAdd(newList.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to create list");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (listId: string) => {
    setAddingToListId(listId);
    try {
      await addVerbToBeList(listId, verb, language, context);
      toast.success(`"${verb}" added to list`);
      setOpen(false);
    } catch (error: any) {
      console.error("Add to list error:", error);
      toast.error(error.message || "Failed to add to list");
    } finally {
      setAddingToListId(null);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children ? children : (
            <Button variant="ghost" size={minimal ? "icon" : "sm"} className="opacity-70">
              {minimal ? <ListPlus className="h-4 w-4" /> : (
                <>
                  <ListPlus className="mr-2 h-4 w-4" />
                  Add to list
                </>
              )}
              <span className="sr-only">Add to list (Login required)</span>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-4">
          <div className="flex flex-col space-y-4">
            <div className="space-y-1.5">
              <DropdownMenuLabel className="p-0 text-base">Login Required</DropdownMenuLabel>
              <p className="text-sm text-muted-foreground">
                You need to be logged in to create personal lists.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => signIn()} className="w-full">
                Log In
              </Button>
              <Button variant="outline" onClick={() => router.push('/signup')} className="w-full">
                Create Account
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {children ? children : (
          <Button variant="ghost" size={minimal ? "icon" : "sm"}>
            {minimal ? <ListPlus className="h-4 w-4" /> : (
              <>
                <ListPlus className="mr-2 h-4 w-4" />
                Add to list
              </>
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-[100]">
        <DropdownMenuLabel>My Lists</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading && lists.length === 0 ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <>
            <DropdownMenuGroup className="max-h-60 overflow-y-auto">
              {lists.map(list => {
                const isMatchingLanguage = list.language?.iso_code === language;
                return (
                  <DropdownMenuItem
                    key={list.id}
                    onSelect={() => handleAdd(list.id)}
                    className="flex justify-between items-center"
                    disabled={addingToListId !== null}
                  >
                    <div className="flex flex-col">
                      <span className={isMatchingLanguage ? "font-medium" : "text-muted-foreground"}>
                        {list.name}
                      </span>
                      {list.language && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {list.language.name}
                          {!isMatchingLanguage && " (Mismatched)"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {addingToListId === list.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        list._count && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{list._count.items}</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
              {lists.length === 0 && !loading && (
                <div className="p-2 text-sm text-center text-muted-foreground">
                  No lists found.
                </div>
              )}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />

        {creating ? (
          <div className="p-3 space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">List Name</span>
              <Input
                placeholder="E.g. Travel Verbs"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateList();
                  }
                }}
                className="h-9 text-sm rounded-lg"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Language</span>
              <Select
                value={selectedNewListLangId || ""}
                onValueChange={setSelectedNewListLangId}
              >
                <SelectTrigger className="h-9 text-sm rounded-lg">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map(lang => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1 h-8 text-xs font-bold" onClick={handleCreateList} disabled={loading || !newListName.trim()}>
                Create & Add
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem
            className="py-2.5 mx-1 my-1 rounded-lg focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              // Try to pre-select local language
              const found = availableLanguages.find(l => l.iso_code === language);
              const initialLangId = languageId || (found ? found.id : null);
              if (initialLangId) setSelectedNewListLangId(initialLangId.toString());
              setCreating(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="font-medium text-sm">Create new list</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
