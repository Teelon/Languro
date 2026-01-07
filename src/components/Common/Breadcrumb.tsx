import Link from "next/link";

const Breadcrumb = ({
  pageName,
  pageDescription,
}: {
  pageName: string;
  pageDescription?: string;
}) => {
  return (
    <>
      <div className="dark:bg-slate-900 relative z-10 overflow-hidden pb-[60px] pt-24 md:pt-28 lg:pt-32">
        <div className="from-slate-200/0 via-slate-200 to-slate-200/0 dark:via-slate-700 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4">
              <div className="text-center">
                <h1 className="text-slate-900 mb-4 text-3xl font-bold dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]">
                  {pageName}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-5 text-base">
                  {pageDescription}
                </p>

                <ul className="flex items-center justify-center gap-[10px]">
                  <li>
                    <Link
                      href="/"
                      className="text-slate-900 flex items-center gap-[10px] text-base font-medium dark:text-white"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <p className="text-slate-600 flex items-center gap-[10px] text-base font-medium">
                      <span className="text-slate-600 dark:text-slate-400">
                        {" "}
                        /{" "}
                      </span>
                      {pageName}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Breadcrumb;
