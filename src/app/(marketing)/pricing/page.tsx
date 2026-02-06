import Breadcrumb from "@/components/Common/Breadcrumb";
// import Faq from "@/components/Faq";
// import Pricing from "@/components/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Training Plans | Languro",
  description: "Select the training regimen that matches your ambitions. Choose from Cadet, Commander, or Elite plans.",
};

const PricingPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Pricing"
        pageDescription="Our pricing plans are currently being updated."
      />

      <section className="relative z-10 overflow-hidden pb-16 pt-16 md:pb-20 md:pt-20 lg:pb-28 lg:pt-28">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[600px] text-center">
                <h2 className="mb-4 text-3xl font-bold !leading-tight text-slate-900 dark:text-white sm:text-4xl md:text-[45px]">
                  Coming Soon
                </h2>
                <p className="mb-10 text-base !leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                  We are working on something exciting! Our new pricing plans will be available shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
      <Breadcrumb pageName="Training Plans" />
      <Pricing />
      <Faq />
       */}
    </>
  );
};

export default PricingPage;
