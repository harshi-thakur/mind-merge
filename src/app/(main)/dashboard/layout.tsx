// import AppStateProvider from "@/lib/providers/state-provider";
  const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        // <AppStateProvider>
        <main className="flex over-hidden h-screen">
            {children}
        </main>
      //  </AppStateProvider>
    );
  };
  
  export default Layout;