import { BookOpen, Dumbbell, PenTool, Stethoscope } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900 md:py-20 lg:py-24">
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
              icon: <Stethoscope className="h-8 w-8" />,
            },
            {
              step: "02",
              title: "Drill",
              desc: "Targeted morphology and syntax training. Conjugations, contrasts, cloze deletion.",
              icon: <Dumbbell className="h-8 w-8" />,
            },
            {
              step: "03",
              title: "Immerse",
              desc: "Read and listen at scale. Graded readers, real content, sentence mining.",
              icon: <BookOpen className="h-8 w-8" />,
            },
            {
              step: "04",
              title: "Produce",
              desc: "Write and speak. Get corrected. AI feedback with explanations and drill links.",
              icon: <PenTool className="h-8 w-8" />,
            },
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

