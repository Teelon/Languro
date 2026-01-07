const CoreModules = () => {
  return (
    <section className="bg-slate-900 pb-16 pt-16 md:pb-20 md:pt-20 lg:pb-28 lg:pt-28">
      <div className="container">
        <div className="mb-16">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-[40px]">
            Core Modules
          </h2>
          <p className="text-base text-slate-400">
            The engines that drive your proficiency.
          </p>
        </div>

        <div className="space-y-16">
          {/* Module A */}
          <div className="flex flex-col md:flex-row items-start gap-8 border-b border-slate-800 pb-12">
            <div className="w-full md:w-1/3">
              <h3 className="text-2xl font-bold text-white mb-2">Grammar Lab</h3>
              <div className="text-blue-500 font-medium mb-4">The Rigor Engine</div>
              <p className="text-slate-400">Master morphology and syntax through deliberate practice. No multiple choice, just pure active recall.</p>
            </div>
            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Hyperlinked grammar codex</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Adaptive conjugation drills</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Contrastive tense training</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Error-type tracking</div>
            </div>
          </div>

          {/* Module B */}
          <div className="flex flex-col md:flex-row items-start gap-8 border-b border-slate-800 pb-12">
            <div className="w-full md:w-1/3">
              <h3 className="text-2xl font-bold text-white mb-2">Immersion Library</h3>
              <div className="text-green-500 font-medium mb-4">The Input Engine</div>
              <p className="text-slate-400">Build fluency through real reading and listening. Stop reading children's books.</p>
            </div>
            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Graded readers A1–C2</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Adult-topic bridge content</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">One-click sentence mining</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Audio-sync highlighting</div>
            </div>
          </div>

          {/* Module C */}
          <div className="flex flex-col md:flex-row items-start gap-8 border-b border-slate-800 pb-12">
            <div className="w-full md:w-1/3">
              <h3 className="text-2xl font-bold text-white mb-2">Production Studio</h3>
              <div className="text-purple-500 font-medium mb-4">The Output Engine</div>
              <p className="text-slate-400">Turn knowledge into ability. Write, speak, and get critiqued by an AI that understands grammar.</p>
            </div>
            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Daily writing prompts</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">AI correction with explanation</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Grammar-linked drills from mistakes</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Voice roleplay scenarios</div>
            </div>
          </div>

          {/* Module D */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-1/3">
              <h3 className="text-2xl font-bold text-white mb-2">Command Dashboard</h3>
              <div className="text-yellow-500 font-medium mb-4">The Metacognitive Layer</div>
              <p className="text-slate-400">See what you actually know. Data-driven insights to optimize your study routine.</p>
            </div>
            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Grammar heatmap</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Known words estimate</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Immersion hours tracking</div>
              <div className="bg-slate-800 p-4 rounded text-slate-300 border border-slate-700">Weakness-driven study plan</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CoreModules;
