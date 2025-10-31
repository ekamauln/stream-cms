import { Footer } from "@/components/custom-ui/footer";
import { Header } from "@/components/custom-ui/header";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div>{children}</div>
      <Footer />
    </div>
  );
};

export default PublicLayout;
