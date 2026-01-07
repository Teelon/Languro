const HowItWorks = () => {
  return (
    <section className="bg-slate-50 pb-16 pt-16 dark:bg-slate-900 md:pb-20 md:pt-20 lg:pb-28 lg:pt-28">
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl md:text-[40px]">
            How It Works
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            A systematic approach to proficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Diagnose",
              desc: "We map your grammar and vocabulary gaps. No linear paths. No assumptions.",
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              )
            },
            {
              step: "02",
              title: "Drill",
              desc: "Targeted morphology and syntax training. Conjugations, contrasts, cloze deletion.",
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              )
            },
            {
              step: "03",
              title: "Immerse",
              desc: "Read and listen at scale. Graded readers, real content, sentence mining.",
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              )
            },
            {
              step: "04",
              title: "Produce",
              desc: "Write and speak. Get corrected. AI feedback with explanations and drill links.",
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              )
            }
          ].map((feature, i) => (
            <div key={i} className="group relative overflow-hidden rounded-sm bg-white px-6 py-8 shadow-sm duration-300 hover:shadow-lg dark:bg-slate-800 dark:hover:bg-slate-700">
              <div className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-md bg-blue-600 bg-opacity-10 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white dark:text-blue-500">
                {feature.icon}
              </div>
              <div className="mb-2 text-xl font-bold text-blue-600 dark:text-blue-400">{feature.step}</div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-base font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

