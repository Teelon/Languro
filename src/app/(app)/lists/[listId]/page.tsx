"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUserList, fetchListItems, deleteUserList, deleteUserListItem, UserList } from '@/features/user-lists/services/userLists';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  ArrowLeft,
  Trash2,
  BookOpen,
  Search,
  Play,
  MoreVertical,
  Calendar,
  Languages,
  LayoutGrid,
  List as ListIcon,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DrillSetupModal } from '@/components/drill/DrillSetupModal';
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function ListDetailPage() {
  const { listId } = useParams() as { listId: string };
  const router = useRouter();
  const { data: session, status } = useSession();

  const [list, setList] = useState<UserList | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingList, setIsDeletingList] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    if (session?.user && listId) {
      loadData();
    }
  }, [listId, session]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listData, itemsData] = await Promise.all([
        fetchUserList(listId),
        fetchListItems(listId)
      ]);
      setList(listData);
      setItems(itemsData);
    } catch (error) {
      toast.error("Failed to load list details");
      router.push('/lists');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.word.toLowerCase().includes(query) ||
      (item.definition && item.definition.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  const handleDeleteItem = async (itemId: string) => {
    setDeletingId(itemId);
    try {
      await deleteUserListItem(listId, itemId);
      setItems(items.filter(item => item.id !== itemId));
      toast.success("Item removed from list");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm("Are you sure you want to delete this list? All vocabulary and progress will be lost.")) {
      return;
    }

    setIsDeletingList(true);
    try {
      await deleteUserList(listId);
      toast.success("List deleted successfully");
      router.push('/lists');
    } catch (error) {
      toast.error("Failed to delete list");
      setIsDeletingList(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
        <p className="text-muted-foreground animate-pulse">Loading your vocabulary...</p>
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      {/* Premium Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-8 md:p-12 text-white shadow-2xl border border-white/5"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full -ml-10 -mb-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-white/10 -ml-2"
              onClick={() => router.push('/lists')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Lists
            </Button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  {list.name}
                </h1>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-7 px-3 text-sm flex gap-2">
                  <Languages className="h-3.5 w-3.5 text-primary-foreground/70" />
                  {list.language?.name || 'Unknown'}
                </Badge>
              </div>
              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                {list.description || `Master your ${list.language?.name || 'vocabulary'} with this personalized collection.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 opacity-70" />
                <span className="font-medium text-slate-200">{items.length}</span> verbs
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 opacity-70" />
                Created {format(new Date(list.createdAt || Date.now()), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DrillSetupModal
              listId={list.id}
              trigger={
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold text-base h-12 bg-primary hover:bg-primary-hover">
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Start Practice
                </Button>
              }
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 h-12 w-12">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1">
                <DropdownMenuItem className="flex gap-2">
                  <Languages className="h-4 w-4 text-muted-foreground" /> Edit Info
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive flex gap-2 cursor-pointer"
                  onClick={handleDeleteList}
                  disabled={isDeletingList}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletingList ? 'Deleting...' : 'Delete List'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Action Bar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search within this list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/40 border-muted-foreground/20 rounded-xl focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center bg-muted/30 rounded-xl p-1 border">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-lg h-9 px-3 flex gap-2"
            onClick={() => setViewMode('list')}
          >
            <ListIcon className="h-4 w-4" /> List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-lg h-9 px-3 flex gap-2"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" /> Grid
          </Button>
        </div>
      </div>

      {/* Main List Area */}
      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-muted/20 border border-dashed rounded-3xl"
        >
          <div className="max-w-xs mx-auto space-y-3">
            <div className="bg-muted w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold">No results found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "This list doesn't have any vocabulary items yet."}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">
                Clear search
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-3"
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, delay: index < 15 ? index * 0.05 : 0 }}
                className={
                  viewMode === 'grid'
                    ? "bg-card hover:bg-accent/5 transition-colors border rounded-2xl p-6 shadow-sm group hover:shadow-md relative"
                    : "bg-card hover:bg-accent/5 transition-colors border rounded-2xl p-4 flex items-center justify-between shadow-sm group relative"
                }
              >
                <div className={viewMode === 'list' ? "flex items-center gap-4 flex-1" : "space-y-3"}>
                  <div className={
                    viewMode === 'list'
                      ? "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0"
                      : "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl"
                  }>
                    {item.word.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 pr-10">
                    <h3 className="text-xl font-bold tracking-tight truncate">{item.word}</h3>
                    {item.definition && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {item.definition}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Added {format(new Date(item.addedAt), 'MMM d')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={
                  viewMode === 'list'
                    ? "flex items-center gap-2"
                    : "absolute top-4 right-4"
                }>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
