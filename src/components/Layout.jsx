import { Toaster } from "sonner";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
// import SlidingSidebar from "./SlidingSidebar";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Toaster richColors closeButton position="top-center" />
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 bg-white">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}