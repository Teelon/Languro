'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateProfile } from '@/actions/account';
import { toast } from 'sonner';
import { User, Globe, Trophy, Languages, Save } from 'lucide-react';

interface ProfileTabProps {
  user: any; // Type this properly if possible
}

export function ProfileTab({ user }: ProfileTabProps) {
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  const handleFormChange = () => {
    setHasChanges(true);
  };

  const handleSelectChange = (value: string) => {
    setHasChanges(true); // Simple trigger for select changes
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await updateProfile(formData);
        toast.success('Profile updated successfully');
        setHasChanges(false);
      } catch (error) {
        toast.error('Failed to update profile');
      }
    });
  };

  // Get initials for avatar
  const initials = user.name
    ? user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'U';

  return (
    <form onSubmit={handleSubmit} onChange={handleFormChange} className="space-y-6">
      {/* Profile Header & Personal Info */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="text-base bg-primary/10 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background ring-1 ring-green-500/20" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold tracking-tight">Profile Details</CardTitle>
              <CardDescription className="text-sm">
                Manage your public profile and personal information.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-4 grid gap-4">
          <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="name" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              Display Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name || ''}
              placeholder="Your Name"
              className="h-9 bg-background/50 focus:bg-background transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20 p-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-4 w-4 text-primary" />
            Language Settings
          </CardTitle>
          <CardDescription className="text-sm">
            Configure your native and target languages to personalize your learning.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-4 grid gap-4 md:grid-cols-2">
          {/* Native Language */}
          <div className="p-3 rounded-lg border border-border/50 bg-card hover:border-primary/20 transition-colors space-y-2">
            <Label htmlFor="nativeLanguage" className="text-sm font-medium flex items-center gap-2">
              <Languages className="h-3.5 w-3.5 text-blue-500" />
              Native Language
            </Label>
            <Select
              name="nativeLanguage"
              defaultValue={user.onboardingProfile?.nativeLanguage}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="h-9 bg-background/50 hover:bg-background hover:border-primary/50 transition-all text-sm">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (English)</SelectItem>
                <SelectItem value="es">Spanish (Español)</SelectItem>
                <SelectItem value="fr">French (Français)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Language */}
          <div className="p-3 rounded-lg border border-border/50 bg-card hover:border-primary/20 transition-colors space-y-2">
            <Label htmlFor="targetLanguage" className="text-sm font-medium flex items-center gap-2">
              <Languages className="h-3.5 w-3.5 text-green-500" />
              Target Language
            </Label>
            <Select
              name="targetLanguage"
              defaultValue={user.onboardingProfile?.targetLanguage}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="h-9 bg-background/50 hover:bg-background hover:border-primary/50 transition-all text-sm">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (English)</SelectItem>
                <SelectItem value="es">Spanish (Español)</SelectItem>
                <SelectItem value="fr">French (Français)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CEFR Level - Full Width or separate */}
          <div className="md:col-span-2 p-3 rounded-lg border border-border/50 bg-card hover:border-primary/20 transition-colors space-y-2">
            <Label htmlFor="cefrLevel" className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-yellow-500" />
              Current Proficiency Level (CEFR)
            </Label>
            <Select
              name="cefrLevel"
              defaultValue={user.onboardingProfile?.cefrLevel}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="h-9 bg-background/50 hover:bg-background hover:border-primary/50 transition-all text-sm">
                <SelectValue placeholder="Select your proficiency level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A1">A1 - Beginner (Breakthrough)</SelectItem>
                <SelectItem value="A2">A2 - Elementary (Waystage)</SelectItem>
                <SelectItem value="B1">B1 - Intermediate (Threshold)</SelectItem>
                <SelectItem value="B2">B2 - Upper Intermediate (Vantage)</SelectItem>
                <SelectItem value="C1">C1 - Advanced (Effective Operational Proficiency)</SelectItem>
                <SelectItem value="C2">C2 - Proficient (Mastery)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-end pt-4 sticky bottom-6 z-10">
        <div className={`transition-all duration-300 transform ${hasChanges ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
          <Button
            type="submit"
            disabled={isPending}
            size="lg"
            className="shadow-xl bg-primary hover:bg-primary/90 min-w-[150px]"
          >
            {isPending ? (
              'Saving...'
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
