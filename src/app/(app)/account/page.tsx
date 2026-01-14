import { getAccountData } from '@/actions/account';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTab } from '@/features/account/components/profile-tab';
import { PreferencesTab } from '@/features/account/components/preferences-tab';

export default async function AccountPage() {
  const user = await getAccountData();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8 pt-0 max-w-4xl mx-auto w-full">
      <div className="flex-1 rounded-xl bg-transparent md:min-h-min">
        <div className="mb-6 pl-1">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Account Settings</h1>
          <p className="text-base text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full space-y-8">
          <TabsList className="bg-muted/50 p-1 h-11 w-full sm:w-auto justify-start rounded-lg mb-4">
            <TabsTrigger value="profile" className="h-9 px-6 rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Profile</TabsTrigger>
            <TabsTrigger value="preferences" className="h-9 px-6 rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <ProfileTab user={user} />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <PreferencesTab preferences={(user as any).preferences || {}} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
