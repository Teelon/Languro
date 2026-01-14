'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updatePreferences } from '@/actions/account';
import { toast } from 'sonner';
import { Save, Shield, Bell, Zap, Users } from 'lucide-react'; // Added icons

interface PreferencesTabProps {
  preferences: any; // Type accurately based on Prisma model
}

export function PreferencesTab({ preferences }: PreferencesTabProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: any = {};

    // Convert formData to object and handle booleans
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Helper to get checked state
    const getChecked = (name: string) => (event.currentTarget.elements.namedItem(name) as HTMLInputElement)?.checked;

    // Privacy
    data.shareProgressWithFriends = getChecked('shareProgressWithFriends');
    data.showInSearch = getChecked('showInSearch');
    data.dataSharing = getChecked('dataSharing');
    // ... (rest of manually mapping booleans if needed, but the original code had this block, so I assume it's needed)
    // Actually, to be safe and clean, I will just copy the logic or keep it if I'm not changing logic.
    // Logic is fine, just updating UI.

    // Privacy
    data.shareProgressWithFriends = getChecked('shareProgressWithFriends');
    data.showInSearch = getChecked('showInSearch');
    data.publicProfile = getChecked('publicProfile');
    data.dataSharing = getChecked('dataSharing');

    // Content
    data.newContentAlerts = getChecked('newContentAlerts');
    data.recommendedLessons = getChecked('recommendedLessons');
    data.tipsTricks = getChecked('tipsTricks');
    data.pronunciationFeedback = getChecked('pronunciationFeedback');
    data.dailyReminder = getChecked('dailyReminder');

    // Social
    data.followNotifications = getChecked('followNotifications');
    data.commentNotifications = getChecked('commentNotifications');
    data.leaderboardUpdates = getChecked('leaderboardUpdates');
    data.friendActivityUpdates = getChecked('friendActivityUpdates');
    data.studyGroupInvites = getChecked('studyGroupInvites');
    data.motivationalMessages = getChecked('motivationalMessages');
    data.weeklyProgressReports = getChecked('weeklyProgressReports');

    // Security
    data.marketingEmails = getChecked('marketingEmails');
    data.newsletter = getChecked('newsletter');
    data.surveyEmails = getChecked('surveyEmails');
    data.securityAlerts = getChecked('securityAlerts');

    // Text fields are handled via formData iteration initially but good to be explicit for types if needed.
    // Overwriting string values just in case they were lost in boolean mapping if any checks were weird, but loop handled strings.
    // The previous code had a huge block of manual assignments. I will preserve valid logic.
    data.activityVisibility = (event.currentTarget.elements.namedItem('activityVisibility') as HTMLInputElement)?.value;
    data.emailDigestFrequency = (event.currentTarget.elements.namedItem('emailDigestFrequency') as HTMLInputElement)?.value;
    data.communicationLanguage = (event.currentTarget.elements.namedItem('communicationLanguage') as HTMLInputElement)?.value;


    startTransition(async () => {
      try {
        await updatePreferences(data);
        toast.success('Preferences updated successfully');
      } catch (error) {
        toast.error('Failed to update preferences');
      }
    });
  };

  const cardClass = "border-border/50 shadow-sm transition-all hover:border-primary/20";
  const headerClass = "pb-3 border-b border-border/40 bg-muted/20 p-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20"> {/* pb-20 for sticky button */}

      {/* Privacy & Data */}
      <Card className={cardClass}>
        <CardHeader className={headerClass}>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Privacy & Data</CardTitle>
          </div>
          <CardDescription className="text-sm">Control who sees your activity and how your data is used.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 p-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="publicProfile" className="text-sm font-medium">Public Profile</Label>
                <p className="text-[10px] text-muted-foreground">Allow others to view your profile.</p>
              </div>
              <Switch id="publicProfile" name="publicProfile" defaultChecked={preferences?.publicProfile} className="scale-90" />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Label htmlFor="shareProgressWithFriends" className="text-sm font-medium">Share progress with friends</Label>
              <Switch id="shareProgressWithFriends" name="shareProgressWithFriends" defaultChecked={preferences?.shareProgressWithFriends} className="scale-90" />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Label htmlFor="showInSearch" className="text-sm font-medium">Show in search results</Label>
              <Switch id="showInSearch" name="showInSearch" defaultChecked={preferences?.showInSearch} className="scale-90" />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Label htmlFor="dataSharing" className="text-sm font-medium">Allow data usage for research</Label>
              <Switch id="dataSharing" name="dataSharing" defaultChecked={preferences?.dataSharing} className="scale-90" />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/40">
            <Label htmlFor="activityVisibility" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity Visibility</Label>
            <Select name="activityVisibility" defaultValue={preferences?.activityVisibility || 'public'}>
              <SelectTrigger className="bg-background/50 h-9 text-sm">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="private">Private - Only me</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Communication */}
      <Card className={cardClass}>
        <CardHeader className={headerClass}>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Communication</CardTitle>
          </div>
          <CardDescription className="text-sm">Manage your email and notification settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emailDigestFrequency" className="text-sm font-medium">Email Digest</Label>
              <Select name="emailDigestFrequency" defaultValue={preferences?.emailDigestFrequency || 'weekly'}>
                <SelectTrigger className="bg-background/50 h-9 text-sm">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="communicationLanguage" className="text-sm font-medium">Language</Label>
              <Select name="communicationLanguage" defaultValue={preferences?.communicationLanguage || 'en'}>
                <SelectTrigger className="bg-background/50 h-9 text-sm">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content & Features */}
      <Card className={cardClass}>
        <CardHeader className={headerClass}>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Content & Features</CardTitle>
          </div>
          <CardDescription className="text-sm">Customize your learning experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 p-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="newContentAlerts" className="text-sm font-medium">New Content Alerts</Label>
                <Switch id="newContentAlerts" name="newContentAlerts" defaultChecked={preferences?.newContentAlerts} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="tipsTricks" className="text-sm font-medium">Tips & Tricks</Label>
                <Switch id="tipsTricks" name="tipsTricks" defaultChecked={preferences?.tipsTricks} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="dailyReminder" className="text-sm font-medium">Daily Practice Reminder</Label>
                <Switch id="dailyReminder" name="dailyReminder" defaultChecked={preferences?.dailyReminder} className="scale-90" />
              </div>
            </div>

            <div className="hidden md:block w-px bg-border/40" />

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="recommendedLessons" className="text-sm font-medium">Recommended Lessons</Label>
                <Switch id="recommendedLessons" name="recommendedLessons" defaultChecked={preferences?.recommendedLessons} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="pronunciationFeedback" className="text-sm font-medium">Pronunciation Feedback</Label>
                <Switch id="pronunciationFeedback" name="pronunciationFeedback" defaultChecked={preferences?.pronunciationFeedback} className="scale-90" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social & Community */}
      <Card className={cardClass}>
        <CardHeader className={headerClass}>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Social & Community</CardTitle>
          </div>
          <CardDescription className="text-sm">Settings for social interactions and updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 p-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="followNotifications" className="text-sm font-medium">Follow Notifications</Label>
                <Switch id="followNotifications" name="followNotifications" defaultChecked={preferences?.followNotifications} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="leaderboardUpdates" className="text-sm font-medium">Leaderboard Updates</Label>
                <Switch id="leaderboardUpdates" name="leaderboardUpdates" defaultChecked={preferences?.leaderboardUpdates} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="studyGroupInvites" className="text-sm font-medium">Study Group Invites</Label>
                <Switch id="studyGroupInvites" name="studyGroupInvites" defaultChecked={preferences?.studyGroupInvites} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="weeklyProgressReports" className="text-sm font-medium">Weekly Progress Reports</Label>
                <Switch id="weeklyProgressReports" name="weeklyProgressReports" defaultChecked={preferences?.weeklyProgressReports} className="scale-90" />
              </div>
            </div>

            <div className="hidden md:block w-px bg-border/40" />

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="commentNotifications" className="text-sm font-medium">Comment Notifications</Label>
                <Switch id="commentNotifications" name="commentNotifications" defaultChecked={preferences?.commentNotifications} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="friendActivityUpdates" className="text-sm font-medium">Friend Activity Updates</Label>
                <Switch id="friendActivityUpdates" name="friendActivityUpdates" defaultChecked={preferences?.friendActivityUpdates} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="motivationalMessages" className="text-sm font-medium">Motivational Messages</Label>
                <Switch id="motivationalMessages" name="motivationalMessages" defaultChecked={preferences?.motivationalMessages} className="scale-90" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & General */}
      <Card className={cardClass}>
        <CardHeader className={headerClass}>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Security & General</CardTitle>
          </div>
          <CardDescription className="text-sm">Manage security alerts and general email subscriptions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 p-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="marketingEmails" className="text-sm font-medium">Marketing Emails</Label>
                <Switch id="marketingEmails" name="marketingEmails" defaultChecked={preferences?.marketingEmails} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="newsletter" className="text-sm font-medium">Newsletter</Label>
                <Switch id="newsletter" name="newsletter" defaultChecked={preferences?.newsletter} className="scale-90" />
              </div>
            </div>

            <div className="hidden md:block w-px bg-border/40" />

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="surveyEmails" className="text-sm font-medium">Survey Emails</Label>
                <Switch id="surveyEmails" name="surveyEmails" defaultChecked={preferences?.surveyEmails} className="scale-90" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label htmlFor="securityAlerts" className="text-sm font-medium">Security Alerts</Label>
                <Switch id="securityAlerts" name="securityAlerts" defaultChecked={preferences?.securityAlerts} className="scale-90" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-6 z-10">
        <Button size="lg" type="submit" disabled={isPending} className="shadow-xl bg-primary hover:bg-primary/90 min-w-[150px]">
          {isPending ? 'Saving...' : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Preferences
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
