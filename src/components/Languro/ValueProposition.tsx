const ValueProposition = () => {
  return (
    <section className="relative z-10 bg-white py-16 dark:bg-slate-800 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-1/2">
            <div className="mb-12 lg:mb-0">
              <h2 className="mb-6 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl sm:leading-tight">
                Not a Game. <br />
                Not a Classroom. <br />
                <span className="text-blue-600 dark:text-blue-500">A Language Gym.</span>
              </h2>
              <p className="mb-8 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Languro is built on the principle of deliberate practice: structured drills, massive input, and intelligent feedback. It’s designed for learners who want to understand the system of the language, not just collect words.
              </p>
              <div className="space-y-4">
                {[
                  "Explicit grammar, not guesswork",
                  "Long-form reading, not toy sentences",
                  "AI feedback, not unreliable peer correction",
                  "Data dashboards, not streak pressure",
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="mr-4 flex h-[30px] w-[30px] items-center justify-center rounded-md bg-blue-600 bg-opacity-10 text-blue-600 dark:bg-blue-500 dark:bg-opacity-10 dark:text-blue-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Visual placeholder for the "Gym" concept */}
          <div className="w-full px-4 lg:w-1/2">
            <div className="relative mx-auto aspect-[25/24] max-w-[500px] lg:mr-0">
              <div className="font-mono text-xs text-slate-500 p-4 border border-slate-200 bg-slate-50 shadow-2xl h-full overflow-hidden dark:bg-slate-900 dark:border-slate-700">
                <div className="flex border-b border-slate-200 pb-2 mb-4 dark:border-slate-700">
                  <span className="text-green-600 dark:text-green-400 mr-2">➜</span>
                  <span className="text-blue-600 dark:text-blue-400">~</span>
                  <span className="ml-2">languro train --mode=subjunctive --count=50</span>
                </div>
                <div className="space-y-2">
                  <div className="flex"><span className="w-6 text-slate-400 dark:text-slate-600">1</span><span className="text-purple-600 dark:text-purple-400">Loading Drill Module...</span></div>
                  <div className="flex"><span className="w-6 text-slate-400 dark:text-slate-600">2</span><span className="text-slate-700 dark:text-slate-300">Target: </span><span className="text-yellow-600 dark:text-yellow-300">Spanish Subjunctive vs Indicative</span></div>
                  <div className="flex"><span className="w-6 text-slate-400 dark:text-slate-600">3</span><span className="text-slate-700 dark:text-slate-300">----------------------------------------</span></div>
                  <div className="flex"><span className="w-6 text-slate-400 dark:text-slate-600">4</span><span className="text-slate-700 dark:text-slate-300">Q1: Es posible que ella ___ (venir) mañana.</span></div>
                  <div className="flex"><span className="w-6 text-slate-400 dark:text-slate-600">5</span><span className="text-blue-600 dark:text-blue-400">] vengel</span></div>
                  <div className="flex"><span className="w-6 text-slate-400 dark:text-slate-600">6</span><span className="text-red-500 dark:text-red-400">ERROR: Morphology_Error</span></div>
                  <div className="flex"><span className="w-6 text-slate-400 dark:text-slate-600">7</span><span className="text-slate-500 dark:text-slate-400">Correction: </span><span className="text-green-600 dark:text-green-400">venga</span></div>
                  <div className="flex"><span className="w-6 text-slate-400 dark:text-slate-600">8</span><span className="text-slate-500 dark:text-slate-400">Explanation: Subjunctive required after impersonal expression "Es posible que".</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
