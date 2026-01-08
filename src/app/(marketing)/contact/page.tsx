import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Support | Languro",
  description: "Get in touch with the Languro command center for support or enterprise inquiries.",
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb pageName="Contact Support" />

      <Contact />
    </>
  );
};

export default ContactPage;
