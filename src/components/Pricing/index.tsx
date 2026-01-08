"use client";
import SectionTitle from "../Common/SectionTitle";
import PricingBox from "./PricingBox";
import { pricingData } from "@/stripe/pricingData";

const Pricing = () => {
  return (
    <section
      id="pricing"
      className="relative z-20 overflow-hidden bg-white pb-12 pt-20 dark:bg-slate-950 lg:pb-[90px] lg:pt-28"
    >
      <div className="container">
        <div className="mb-[60px]">
          <SectionTitle
            subtitle="Training Plans"
            title="The Architecture of Mastery"
            paragraph="Select the training regimen that matches your ambitions. Whether you're a weekend cadet or a full-time linguist, we have the right plan for your journey."
            center
          />
        </div>

        <div className="-mx-4 flex flex-wrap justify-center">
          {pricingData.map((product, i) => (
            <PricingBox key={i} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
