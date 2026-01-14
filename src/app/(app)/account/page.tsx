import { getAccountData } from '@/actions/account';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTab } from '@/features/account/components/profile-tab';
import { PreferencesTab } from '@/features/account/components/preferences-tab';

export default async function AccountPage() {
  const user = await getAccountData();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
        <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground mb-6">Manage your account settings and preferences.</p>

        <Tabs defaultValue="profile" className="w-full space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab user={user} />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesTab preferences={(user as any).preferences || {}} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
