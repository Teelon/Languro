import About from "@/components/About";
import AboutPillars from "@/components/About/AboutPillars";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Languro | The Language Learning Gym",
  description:
    "Learn about Languro's mission to provide a rigorous, data-driven approach to language mastery for serious learners.",
};

const AboutPage = () => {
  return (
    <main>
      <Breadcrumb
        pageName="About Languro"
        pageDescription="The science of rigor meets the art of acquisition."
      />
      <About />
      <AboutPillars />
    </main>
  );
};

export default AboutPage;
