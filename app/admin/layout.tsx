import { AdminHeader } from "@/components/custom-ui/admin-header";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Dashboard" />
      <div>{children}</div>
    </div>
  );
};

export default AdminLayout;
