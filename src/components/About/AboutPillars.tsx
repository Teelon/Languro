import React from "react";

const pillars = [
  {
    title: "The Grammar Lab",
    description: "Our 'Rigor Engine' designed for deliberate practice of morphology and syntax. Master complex conjugations and declensions through adaptive drills.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="white" fillOpacity="0.1" />
        <path d="M20 12V28M12 20H28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "The Immersion Library",
    description: "An 'Input Engine' for extensive reading and listening. Import your own content or choose from our graded readers to bridge the gap to native fluency.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="white" fillOpacity="0.1" />
        <path d="M12 14H28M12 20H28M12 26H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "The Production Studio",
    description: "The 'Output Engine' where AI-driven pedagogical feedback helps you refine your writing and speaking without the anxiety of human judgment.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="white" fillOpacity="0.1" />
        <path d="M28 12L12 28M12 12L28 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Commander's Dashboard",
    description: "A data-driven visualization of your personal Knowledge Graph. Track your mastery of specific tenses and vocabulary in real-time.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="white" fillOpacity="0.1" />
        <path d="M12 28V20M20 28V12M28 28V24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const AboutPillars = () => {
  return (
    <section className="bg-white pb-12 pt-20 dark:bg-slate-900 lg:pb-[90px] lg:pt-[120px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto mb-12 max-w-[700px] text-center lg:mb-[70px]">
              <span className="mb-2 block text-lg font-semibold text-primary">
                The Architecture of Rigor
              </span>
              <h2 className="mb-3 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[45px]">
                The Four Pillars of Mastery
              </h2>
              <p className="text-base text-body-color dark:text-dark-6">
                Languro is divided into distinct 'studios' designed to target specific cognitive activities,
                all linked by a central data core that tracks your progress.
              </p>
            </div>
          </div>
        </div>

        <div className="-mx-4 flex flex-wrap">
          {pillars.map((pillar, index) => (
            <div key={index} className="w-full px-4 md:w-1/2 lg:w-1/4">
              <div className="wow fadeInUp group mb-12" data-wow-delay=".1s">
                <div className="relative z-10 mb-8 flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-primary">
                  <span className="absolute left-0 top-0 -z-10 h-full w-full rotate-[15deg] rounded-2xl bg-primary opacity-10 duration-300 group-hover:rotate-0"></span>
                  {pillar.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-dark dark:text-white">
                  {pillar.title}
                </h3>
                <p className="mb-8 text-body-color dark:text-dark-6">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutPillars;
