const Problem = () => {
  return (
    <section id="problem" className="bg-slate-900 pb-16 pt-16 md:pb-20 md:pt-20 lg:pb-28 lg:pt-28">
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-[40px]">
            The Simulation is Broken.
          </h2>
          <p className="text-base text-slate-400">
            Most apps are designed to retain users, not build competence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-3">
          <div className="w-full">
            <div className="mb-8 flex h-[70px] w-[70px] items-center justify-center rounded-md bg-opacity-10 bg-red-500 text-red-500">
              {/* Icon placeholder: Chart going down or broken trophy */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-bold text-white sm:text-2xl lg:text-xl xl:text-2xl">
              The Illusion of Progress
            </h3>
            <ul className="mb-8 space-y-4 text-base text-slate-400">
              <li className="flex items-center">
                <span className="mr-2 text-red-500">✕</span> Streaks ≠ fluency
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-red-500">✕</span> Word banks don’t build sentences
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-red-500">✕</span> Recognition is not production
              </li>
            </ul>
          </div>

          <div className="w-full">
            <div className="mb-8 flex h-[70px] w-[70px] items-center justify-center rounded-md bg-opacity-10 bg-yellow-500 text-yellow-500">
              {/* Icon placeholder: Puzzle piece missing */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12L22 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-bold text-white sm:text-2xl lg:text-xl xl:text-2xl">
              The Grammar Void
            </h3>
            <ul className="mb-8 space-y-4 text-base text-slate-400">
              <li className="flex items-center">
                <span className="mr-2 text-yellow-500">!</span> No heavy conjugation practice
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-yellow-500">!</span> No sentence structure training
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-yellow-500">!</span> No explanation of why errors happen
              </li>
            </ul>
          </div>

          <div className="w-full">
            <div className="mb-8 flex h-[70px] w-[70px] items-center justify-center rounded-md bg-opacity-10 bg-orange-500 text-orange-500">
              {/* Icon placeholder: Book closed */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-bold text-white sm:text-2xl lg:text-xl xl:text-2xl">
              The Literacy Gap
            </h3>
            <ul className="mb-8 space-y-4 text-base text-slate-400">
              <li className="flex items-center">
                <span className="mr-2 text-orange-500">?</span> No long-form reading
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-orange-500">?</span> No real writing practice
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-orange-500">?</span> No serious feedback loop
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
