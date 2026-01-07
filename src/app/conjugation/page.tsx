import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import AppLayout from "@/app/(app)/layout";
import MarketingLayout from "@/app/(marketing)/layout";
import ConjugatorPageContent from "@/features/conjugator/components/ConjugatorPageContent";

export default async function ConjugatorPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <AppLayout>
        <ConjugatorPageContent />
      </AppLayout>
    );
  }

  return (
    <MarketingLayout>
      <ConjugatorPageContent />
    </MarketingLayout>
  );
}
