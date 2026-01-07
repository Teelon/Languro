const SocialProof = () => {
  return (
    <section className="bg-slate-50 pb-8 pt-8 border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="container">
        <div className="flex flex-wrap justify-center gap-8 md:gap-20 opacity-90 dark:opacity-70">
          <p className="flex items-center text-lg font-medium text-slate-600 dark:text-slate-400">
            <span className="mr-2 text-2xl">🎓</span> Built with input from serious language learners
          </p>
          <p className="flex items-center text-lg font-medium text-slate-600 dark:text-slate-400">
            <span className="mr-2 text-2xl">🧠</span> Inspired by Refold, Kwiziq, and cognitive science
          </p>
          <p className="flex items-center text-lg font-medium text-slate-600 dark:text-slate-400">
            <span className="mr-2 text-2xl">📈</span> Designed for CEFR progression, not dopamine loops
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
