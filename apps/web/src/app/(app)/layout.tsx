import { SideMenu } from "@/components/shell/SideMenu";
import { Navbar } from "@/components/shell/Navbar";
import { CartProvider } from "@/context/CartContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <SideMenu />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
