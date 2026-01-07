import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative z-10 bg-slate-950 pt-16 md:pt-20 lg:pt-24 border-t border-slate-800">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-5/12">
            <div className="mb-12 max-w-[360px] lg:mb-16">
              <Link href="/" className="mb-8 inline-block text-2xl font-bold text-white">
                Languro
              </Link>
              <p className="mb-9 text-base leading-relaxed text-slate-400">
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
              <h2 className="mb-10 text-xl font-bold text-white">Reference</h2>
              <ul>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-400 hover:text-primary">
                    Methodology
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-400 hover:text-primary">
                    Grammar Codex
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-400 hover:text-primary">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-white">Company</h2>
              <ul>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-400 hover:text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-400 hover:text-primary">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-400 hover:text-primary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-white">Legal</h2>
              <ul>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-400 hover:text-primary">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="mb-4 inline-block text-base text-slate-400 hover:text-primary">
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
