import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CoreModules = () => {
  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900 md:py-20 lg:py-24">
      <div className="container">
        <div className="mb-16">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl md:text-[40px]">
            Core Modules
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            The engines that drive your proficiency.
          </p>
        </div>

        <div className="space-y-16">
          {/* Module A */}
          <div className="flex flex-col gap-8 border-b border-slate-200 pb-12 dark:border-slate-800 md:flex-row items-start">
            <div className="w-full md:w-1/3">
              <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Grammar Lab</h3>
              <div className="mb-4 font-medium text-blue-600 dark:text-blue-500">The Rigor Engine</div>
              <p className="text-slate-600 dark:text-slate-400">Master morphology and syntax through deliberate practice. No multiple choice, just pure active recall.</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:w-2/3">
              {[
                "Hyperlinked grammar codex",
                "Adaptive conjugation drills",
                "Contrastive tense training",
                "Error-type tracking"
              ].map((item, i) => (
                <Card key={i} className="transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700">
                  <CardContent className="p-4 pt-4">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Module B */}
          <div className="flex flex-col gap-8 border-b border-slate-200 pb-12 dark:border-slate-800 md:flex-row items-start">
            <div className="w-full md:w-1/3">
              <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Immersion Library</h3>
              <div className="mb-4 font-medium text-green-600 dark:text-green-500">The Input Engine</div>
              <p className="text-slate-600 dark:text-slate-400">Build fluency through real reading and listening. Stop reading children's books.</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:w-2/3">
              {[
                "Graded readers A1–C2",
                "Adult-topic bridge content",
                "One-click sentence mining",
                "Audio-sync highlighting"
              ].map((item, i) => (
                <Card key={i} className="transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700">
                  <CardContent className="p-4 pt-4">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Module C */}
          <div className="flex flex-col gap-8 border-b border-slate-200 pb-12 dark:border-slate-800 md:flex-row items-start">
            <div className="w-full md:w-1/3">
              <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Production Studio</h3>
              <div className="mb-4 font-medium text-purple-600 dark:text-purple-500">The Output Engine</div>
              <p className="text-slate-600 dark:text-slate-400">Turn knowledge into ability. Write, speak, and get critiqued by an AI that understands grammar.</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:w-2/3">
              {[
                "Daily writing prompts",
                "AI correction with explanation",
                "Grammar-linked drills from mistakes",
                "Voice roleplay scenarios"
              ].map((item, i) => (
                <Card key={i} className="transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700">
                  <CardContent className="p-4 pt-4">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Module D */}
          <div className="flex flex-col gap-8 md:flex-row items-start">
            <div className="w-full md:w-1/3">
              <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Command Dashboard</h3>
              <div className="mb-4 font-medium text-yellow-600 dark:text-yellow-500">The Metacognitive Layer</div>
              <p className="text-slate-600 dark:text-slate-400">See what you actually know. Data-driven insights to optimize your study routine.</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:w-2/3">
              {[
                "Grammar heatmap",
                "Known words estimate",
                "Immersion hours tracking",
                "Weakness-driven study plan"
              ].map((item, i) => (
                <Card key={i} className="transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700">
                  <CardContent className="p-4 pt-4">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CoreModules;
