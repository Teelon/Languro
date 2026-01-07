import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative z-10 overflow-hidden bg-white pb-16 pt-[120px] dark:bg-slate-900 md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[180px] 2xl:pb-[200px] 2xl:pt-[210px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[800px] text-center">
              <h1 className="mb-5 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
                The Architecture of Rigor.
              </h1>
              <p className="mb-12 text-base !leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg md:text-xl">
                Stop playing games. Start building proficiency. <br />
                The ultimate tool for the dedicated autodidact.
              </p>
              <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link
                  href="/signup"
                  className="rounded-sm bg-blue-600 px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-blue-700/80"
                >
                  Enter the Gym
                </Link>
                <Link
                  href="#methodology"
                  className="inline-block rounded-sm bg-slate-100 px-8 py-4 text-base font-semibold text-slate-900 duration-300 ease-in-out hover:bg-slate-200/80 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700/80"
                >
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background elements could go here */}
      <div className="absolute top-0 right-0 -z-10 opacity-30">
        <svg
          width="450"
          height="556"
          viewBox="0 0 450 556"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="277" cy="63" r="225" fill="url(#paint0_linear_25:217)" />
          <defs>
            <linearGradient
              id="paint0_linear_25:217"
              x1="-199.642"
              y1="-300.742"
              x2="277"
              y2="63"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 -z-10 opacity-30">
        <svg
          width="364"
          height="201"
          viewBox="0 0 364 201"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.88971 60.0618C-2.29147 17.514 17.541 4.70422 35.8116 1.05051C33.3274 2.87116 31.8122 5.61715 31.6322 8.65773C31.5284 10.413 32.0673 12.1287 33.1672 13.535C33.6599 14.1642 34.2546 14.7063 34.9288 15.1118C36.177 15.8624 37.6015 16.2226 39.043 16.1601C46.8041 15.8239 52.8228 9.35122 52.4868 1.59011C52.1509 -6.17099 45.6781 -12.1897 37.917 -11.8535C36.4754 -11.7911 35.051 -12.1512 33.8028 -12.9018C33.1286 -13.3073 32.5338 -13.8494 32.0411 -14.4786C30.9413 -15.8849 30.4023 -17.6006 30.5061 -19.3559C30.6861 -22.3965 32.2013 -25.1425 34.6855 -26.9631C16.4149 -30.6168 -3.41753 -17.807 -11.5987 24.7408C-19.7799 67.2886 9.3891 96.4532 27.6597 100.107C30.1439 98.2863 31.6591 95.5403 31.8391 92.4997C31.9429 90.7444 31.4039 89.0287 30.3041 87.6224C29.8114 86.9932 29.2166 86.4511 28.5424 86.0456C27.2942 85.295 25.8698 84.9348 24.4282 84.9974C16.6671 85.3335 10.6484 91.8062 10.9844 99.5673C11.3205 107.328 17.7932 113.347 25.5543 113.011C26.9958 112.949 28.4203 113.309 29.6685 114.059C30.3427 114.465 30.9375 115.007 31.4302 115.636C32.53 117.042 33.069 118.758 32.9652 120.513C32.7852 123.554 31.27 126.3 28.7858 128.121C47.0564 131.774 66.8889 118.965 75.0701 76.4169Z"
            fill="url(#paint1_linear_25:217)"
          />
          <defs>
            <linearGradient
              id="paint1_linear_25:217"
              x1="22.5414"
              y1="48.5539"
              x2="45.5414"
              y2="88.5539"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
