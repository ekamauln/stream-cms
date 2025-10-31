const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <div>{children}</div>
    </div>
  );
};

export default PublicLayout;
