export default function AccountPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences here.</p>

        {/* Placeholder content */}
        <div className="mt-6 space-y-4">
          <div className="bg-card w-full p-6 rounded-lg border">
            <h2 className="text-lg font-semibold">Profile</h2>
            <div className="mt-4 h-8 bg-muted rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="bg-card w-full p-6 rounded-lg border">
            <h2 className="text-lg font-semibold">Security</h2>
            <div className="mt-4 h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
