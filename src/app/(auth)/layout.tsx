import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark:bg-dark">
      <Header />
      {children}
      <Footer />
      <ScrollToTop />
    </div>
  );
}
