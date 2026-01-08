import Breadcrumb from "@/components/Common/Breadcrumb";
import Faq from "@/components/Faq";
import Pricing from "@/components/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Training Plans | Languro",
  description: "Select the training regimen that matches your ambitions. Choose from Cadet, Commander, or Elite plans.",
};

const PricingPage = () => {
  return (
    <>
      <Breadcrumb pageName="Training Plans" />
      <Pricing />
      <Faq />
    </>
  );
};

export default PricingPage;
