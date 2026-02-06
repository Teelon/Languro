import Link from "next/link";
import Logo from "../Common/Logo";

const Footer = () => {
  return (
    <footer className="relative z-10 bg-slate-100 pt-16 border-t border-slate-200 dark:bg-slate-950 dark:border-slate-800 md:pt-20 lg:pt-24">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-5/12">
            <div className="mb-12 max-w-[360px] lg:mb-16">
              <Logo className="mb-8" />
              <p className="mb-9 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                The serious language learning engine for real proficiency.
              </p>
              <div className="flex items-center opacity-70">
                {/* Social icons placeholder */}
                <span className="text-slate-500">Built for the dedicated.</span>
              </div>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-slate-900 dark:text-white">Reference</h2>
              <ul>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500">
                    Methodology
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500">
                    Grammar Codex
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-slate-900 dark:text-white">Company</h2>
              <ul>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-slate-900 dark:text-white">Legal</h2>
              <ul>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
