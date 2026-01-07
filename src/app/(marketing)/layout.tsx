import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="isolate">
      <Header />
      {children}
      <Footer />
      <ScrollToTop />
    </div>
  );
}
