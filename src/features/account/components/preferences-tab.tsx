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

interface PreferencesTabProps {
  preferences: any; // Type accurately based on Prisma model
}

export function PreferencesTab({ preferences }: PreferencesTabProps) {
  const [isPending, startTransition] = useTransition();
  // We can maintain local state if we want instant optimistic updates or just rely on form submission.
  // For a preferences page, auto-saving or bulk saving are options. 
  // Given the number of options, a "Save Changes" button is safer and clearer.
  // But switches usually imply instant actions. 
  // Let's implement form submission for simplicity and consistency with ProfileTab for now.
  // Alternatively, we can trigger individual updates on switch toggle. 
  // Let's stick to a Form for all settings to avoid too many server calls if the user toggles multiple things.

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: any = {};

    // Convert formData to object and handle booleans
    formData.forEach((value, key) => {
      // This loop only catches checked checkboxes/switches if they have a value.
      // Unchecked switches don't appear in FormData usually.
      // So we need to handle booleans carefully.
      data[key] = value;
    });

    // Manual boolean handling since Shadcn Switch might not behave exactly like a native checkbox in FormData depending on implementation
    // Actually Shadcn Switch uses Radix Switch which is a button. It usually works with a hidden input.
    // But to be sure, let's just grab the state from the form if we used controlled components, 
    // OR just use the trick of hidden inputs with the same name.
    // Simplest: Check for existence of key? No, unchecked sends nothing.
    // Better: We must know which fields are booleans.

    // Let's assume the server action handles the merge or we send explicit true/false.
    // If I use controlled components or explicit mapping here:

    // Helper to get checked state
    const getChecked = (name: string) => (event.currentTarget.elements.namedItem(name) as HTMLInputElement)?.checked;

    // Privacy
    data.shareProgressWithFriends = getChecked('shareProgressWithFriends');
    data.showInSearch = getChecked('showInSearch');
    data.dataSharing = getChecked('dataSharing');

    // Content
    data.newContentAlerts = getChecked('newContentAlerts');
    data.recommendedLessons = getChecked('recommendedLessons');
    data.tipsTricks = getChecked('tipsTricks');
    data.pronunciationFeedback = getChecked('pronunciationFeedback');

    // Social
    data.followNotifications = getChecked('followNotifications');
    data.commentNotifications = getChecked('commentNotifications');
    data.leaderboardUpdates = getChecked('leaderboardUpdates');
    data.friendActivityUpdates = getChecked('friendActivityUpdates');
    data.studyGroupInvites = getChecked('studyGroupInvites');
    data.motivationalMessages = getChecked('motivationalMessages');
    data.weeklyProgressReports = getChecked('weeklyProgressReports');

    // Security/General
    data.marketingEmails = getChecked('marketingEmails');
    data.newsletter = getChecked('newsletter');
    data.surveyEmails = getChecked('surveyEmails');
    data.securityAlerts = getChecked('securityAlerts');
    data.dailyReminder = getChecked('dailyReminder');
    data.publicProfile = getChecked('publicProfile');

    // Strings
    data.activityVisibility = (event.currentTarget.elements.namedItem('activityVisibility') as HTMLInputElement)?.value;
    data.emailDigestFrequency = (event.currentTarget.elements.namedItem('emailDigestFrequency') as HTMLInputElement)?.value;
    data.communicationLanguage = (event.currentTarget.elements.namedItem('communicationLanguage') as HTMLInputElement)?.value;
    // Time inputs
    data.pushNotificationTime = (event.currentTarget.elements.namedItem('pushNotificationTime') as HTMLInputElement)?.value;
    data.doNotDisturbStart = (event.currentTarget.elements.namedItem('doNotDisturbStart') as HTMLInputElement)?.value;
    data.doNotDisturbEnd = (event.currentTarget.elements.namedItem('doNotDisturbEnd') as HTMLInputElement)?.value;


    startTransition(async () => {
      try {
        await updatePreferences(data);
        toast.success('Preferences updated successfully');
      } catch (error) {
        toast.error('Failed to update preferences');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
          <CardDescription>Control who sees your activity and how your data is used.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="shareProgressWithFriends">Share progress with friends</Label>
            <Switch id="shareProgressWithFriends" name="shareProgressWithFriends" defaultChecked={preferences?.shareProgressWithFriends} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showInSearch">Show in search results</Label>
            <Switch id="showInSearch" name="showInSearch" defaultChecked={preferences?.showInSearch} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dataSharing">Allow data usage for research/analytics</Label>
            <Switch id="dataSharing" name="dataSharing" defaultChecked={preferences?.dataSharing} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="publicProfile">Public Profile</Label>
            <Switch id="publicProfile" name="publicProfile" defaultChecked={preferences?.publicProfile} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activityVisibility">Activity Visibility</Label>
            <Select name="activityVisibility" defaultValue={preferences?.activityVisibility || 'public'}>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Communication */}
      <Card>
        <CardHeader>
          <CardTitle>Communication</CardTitle>
          <CardDescription>Manage your email and notification settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailDigestFrequency">Email Digest Frequency</Label>
            <Select name="emailDigestFrequency" defaultValue={preferences?.emailDigestFrequency || 'weekly'}>
              <SelectTrigger>
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
          <div className="space-y-2">
            <Label htmlFor="communicationLanguage">Communication Language</Label>
            <Select name="communicationLanguage" defaultValue={preferences?.communicationLanguage || 'en'}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                {/* Add more as needed */}
              </SelectContent>
            </Select>
          </div>
          {/* Time Inputs can be tricky with types, ensure backend handles strings roughly or validate format */}
        </CardContent>
      </Card>

      {/* Content & Features */}
      <Card>
        <CardHeader>
          <CardTitle>Content & Features</CardTitle>
          <CardDescription>Customize your learning experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="newContentAlerts">New Content Alerts</Label>
            <Switch id="newContentAlerts" name="newContentAlerts" defaultChecked={preferences?.newContentAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="recommendedLessons">Recommended Lessons</Label>
            <Switch id="recommendedLessons" name="recommendedLessons" defaultChecked={preferences?.recommendedLessons} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="tipsTricks">Tips & Tricks</Label>
            <Switch id="tipsTricks" name="tipsTricks" defaultChecked={preferences?.tipsTricks} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pronunciationFeedback">Pronunciation Feedback</Label>
            <Switch id="pronunciationFeedback" name="pronunciationFeedback" defaultChecked={preferences?.pronunciationFeedback} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dailyReminder">Daily Practice Reminder</Label>
            <Switch id="dailyReminder" name="dailyReminder" defaultChecked={preferences?.dailyReminder} />
          </div>
        </CardContent>
      </Card>

      {/* Social & Community */}
      <Card>
        <CardHeader>
          <CardTitle>Social & Community</CardTitle>
          <CardDescription>Settings for social interactions and updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="followNotifications">Follow Notifications</Label>
            <Switch id="followNotifications" name="followNotifications" defaultChecked={preferences?.followNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="commentNotifications">Comment Notifications</Label>
            <Switch id="commentNotifications" name="commentNotifications" defaultChecked={preferences?.commentNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="leaderboardUpdates">Leaderboard Updates</Label>
            <Switch id="leaderboardUpdates" name="leaderboardUpdates" defaultChecked={preferences?.leaderboardUpdates} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="friendActivityUpdates">Friend Activity Updates</Label>
            <Switch id="friendActivityUpdates" name="friendActivityUpdates" defaultChecked={preferences?.friendActivityUpdates} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="studyGroupInvites">Study Group Invites</Label>
            <Switch id="studyGroupInvites" name="studyGroupInvites" defaultChecked={preferences?.studyGroupInvites} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="motivationalMessages">Motivational Messages</Label>
            <Switch id="motivationalMessages" name="motivationalMessages" defaultChecked={preferences?.motivationalMessages} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="weeklyProgressReports">Weekly Progress Reports</Label>
            <Switch id="weeklyProgressReports" name="weeklyProgressReports" defaultChecked={preferences?.weeklyProgressReports} />
          </div>
        </CardContent>
      </Card>

      {/* Security & General */}
      <Card>
        <CardHeader>
          <CardTitle>Security & General</CardTitle>
          <CardDescription>Manage security alerts and general email subscriptions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="marketingEmails">Marketing Emails</Label>
            <Switch id="marketingEmails" name="marketingEmails" defaultChecked={preferences?.marketingEmails} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="newsletter">Newsletter</Label>
            <Switch id="newsletter" name="newsletter" defaultChecked={preferences?.newsletter} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="surveyEmails">Survey Emails</Label>
            <Switch id="surveyEmails" name="surveyEmails" defaultChecked={preferences?.surveyEmails} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="securityAlerts">Security Alerts</Label>
            <Switch id="securityAlerts" name="securityAlerts" defaultChecked={preferences?.securityAlerts} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-4">
        <Button size="lg" type="submit" disabled={isPending} className="shadow-lg">
          {isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
}
