const Comparison = () => {
  return (
    <section className="bg-slate-50 pb-16 pt-16 border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 md:pb-20 md:pt-20 lg:pb-28 lg:pt-28">
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl md:text-[40px]">
            You vs The Market
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            We optimize for outcomes, not engagement metrics.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-md dark:shadow-none">
          <table className="w-full text-left text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 uppercase text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Feature</th>
                <th className="px-6 py-4 font-medium">Typical Apps</th>
                <th className="px-6 py-4 font-bold text-blue-600 dark:text-blue-500">Languro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/50">
              {[
                { feature: "Grammar", typical: "Implicit tips", languro: "Explicit + Adaptive" },
                { feature: "Reading", typical: "Short sentences", languro: "Long-form graded" },
                { feature: "Writing", typical: "Drag & drop", languro: "Free production + AI" },
                { feature: "Feedback", typical: "Right/Wrong", languro: "Explained & Linked" },
                { feature: "Motivation", typical: "Streaks", languro: "Mastery Dashboards" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.feature}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-500">{row.typical}</td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{row.languro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
