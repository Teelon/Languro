
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Check if user has completed onboarding
  const profile = await prisma.userOnboardingProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!profile || !profile.completed) {
    redirect('/onboarding');
  }

  // Fetch user lists
  const userLists = await prisma.userList.findMany({
    where: {
      userId: session.user.id,
      isActive: true
    },
    include: {
      _count: { select: { items: true } },
      language: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {session.user.name || 'User'}! 👋
          </h2>
          <p className="text-muted-foreground">Here is what's happening with your language learning today.</p>
        </div>



        <div className="px-4 lg:px-6 space-y-6">

          {userLists.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No learning lists yet</h3>
              <p className="text-muted-foreground mb-4">Create your first list or choose a starter pack to begin.</p>
              <a
                href="/packs" // Assuming this route exists or will exist
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Browse Starter Packs
              </a>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Learning Lists</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userLists.map(list => (
                  <div key={list.id} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg line-clamp-1">{list.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                      </div>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full capitalize">
                        {list.language.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {list._count.items} items
                      </span>
                      <a
                        href={`/drill?listId=${list.id}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                      >
                        Start Drill
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}

