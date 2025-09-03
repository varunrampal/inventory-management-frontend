import { useState } from "react";
import { Toaster } from "sonner";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar"; // <- the nested/sliding sidebar I gave earlier

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Notifications */}
      <Toaster richColors closeButton position="top-center" />

      {/* Header with toggle button */}
      <Header onMenuClick={() => setOpen((v) => !v)} />

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar with mobile open/close */}
        <Sidebar open={open} setOpen={setOpen} />

        {/* Main content */}
        <main className="flex-1 p-4 bg-white overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
