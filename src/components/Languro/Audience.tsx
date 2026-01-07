const Audience = () => {
  return (
    <section className="bg-slate-800 pb-16 pt-16 md:pb-20 md:pt-20 lg:pb-28 lg:pt-28">
      <div className="container">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">

          {/* For Who */}
          <div>
            <h3 className="mb-6 text-2xl font-bold text-white">
              Built For
            </h3>
            <ul className="space-y-4">
              {[
                "Serious autodidacts",
                "University students",
                "Immigrants seeking proficiency",
                "Professionals working in another language",
                "Language nerds who love structure"
              ].map((item, i) => (
                <li key={i} className="flex items-center text-slate-300">
                  <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Not For Who */}
          <div>
            <h3 className="mb-6 text-2xl font-bold text-white">
              Not For
            </h3>
            <ul className="space-y-4">
              {[
                "People who only want games",
                "Tourists looking for 10 phrases",
                "Users allergic to grammar",
                "Anyone chasing streaks over skill"
              ].map((item, i) => (
                <li key={i} className="flex items-center text-slate-400">
                  <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Audience;
