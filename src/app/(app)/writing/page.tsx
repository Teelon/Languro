import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/utils/prismaDB';
import { WritingPractice } from '@/components/writing/WritingPractice';
import { WritingHistory } from '@/components/writing/WritingHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, History } from 'lucide-react';

export default async function WritingPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/auth/signin');
    }

    // Get user's target language and level
    const userProfile = await prisma.userOnboardingProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            targetLanguage: true,
            nativeLanguage: true
        }
    });

    if (!userProfile) {
        redirect('/onboarding');
    }

    // Get recent submissions count for tab badge
    const submissionCount = await prisma.writingSubmission.count({
        where: { userId: session.user.id }
    });

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Writing Practice</h1>
                <p className="text-muted-foreground">
                    Describe images in {userProfile.targetLanguage.name} and get instant AI feedback
                </p>
            </div>

            <Tabs defaultValue="practice" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="practice" className="flex items-center gap-2">
                        <PenLine className="h-4 w-4" />
                        New Practice
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        History {submissionCount > 0 && `(${submissionCount})`}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="practice" className="mt-6">
                    <WritingPractice
                        targetLanguage={userProfile.targetLanguage.name}
                        nativeLanguage={userProfile.nativeLanguage.name}
                        cefrLevel={userProfile.cefrLevel}
                    />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <WritingHistory />
                </TabsContent>
            </Tabs>
        </div>
    );
}
