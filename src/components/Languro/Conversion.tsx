import Link from "next/link";

const Conversion = () => {
  return (
    <section className="bg-white pb-16 pt-16 dark:bg-slate-900 md:pb-20 md:pt-20 lg:pb-28 lg:pt-28">
      <div className="container">
        <div className="rounded-sm bg-blue-600 px-8 py-16 text-center dark:bg-dark-2 sm:px-[70px] md:px-12 lg:px-16 xl:px-[70px]">
          <h2 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[45px]">
            Ready to train like a linguist?
          </h2>
          <p className="mx-auto mb-10 max-w-[600px] text-base font-medium leading-relaxed text-white">
            Join the early access list and help shape the future of serious language learning.
          </p>

          <form className="mx-auto max-w-[500px] space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-sm border border-transparent bg-white px-6 py-4 text-base text-slate-900 placeholder-slate-500 shadow-one outline-none focus-visible:shadow-none dark:bg-dark dark:text-white"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Target Language"
                className="w-full rounded-sm border border-transparent bg-white px-6 py-4 text-base text-slate-900 placeholder-slate-500 shadow-one outline-none focus-visible:shadow-none dark:bg-dark dark:text-white"
              />
              <input
                type="text"
                placeholder="Current Level (e.g. A2)"
                className="w-full rounded-sm border border-transparent bg-white px-6 py-4 text-base text-slate-900 placeholder-slate-500 shadow-one outline-none focus-visible:shadow-none dark:bg-dark dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-sm bg-slate-900 px-6 py-4 text-base font-bold text-white shadow-signup duration-300 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Request Early Access
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Conversion;
