import ConjugatorPageContent from "@/features/conjugator/components/ConjugatorPageContent";

export default function DashboardConjugationPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ConjugatorPageContent fluid className="pt-0 min-h-0 w-[100%] max-w-none" />
    </div>
  );
}
