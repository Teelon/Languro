const CoreModules = () => {
  return (
    <section className="bg-slate-50 pb-16 pt-16 dark:bg-slate-900 md:pb-20 md:pt-20 lg:pb-28 lg:pt-28">
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
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Hyperlinked grammar codex</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Adaptive conjugation drills</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Contrastive tense training</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Error-type tracking</div>
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
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Graded readers A1–C2</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Adult-topic bridge content</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">One-click sentence mining</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Audio-sync highlighting</div>
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
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Daily writing prompts</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">AI correction with explanation</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Grammar-linked drills from mistakes</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Voice roleplay scenarios</div>
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
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Grammar heatmap</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Known words estimate</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Immersion hours tracking</div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Weakness-driven study plan</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CoreModules;
