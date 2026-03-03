import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import CartDrawer from "./components/CartDrawer";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";

type Page = "store" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("store");
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      {page === "store" && (
        <StorePage
          onNavigateAdmin={() => setPage("admin")}
          onOpenCart={() => setCartOpen(true)}
        />
      )}
      {page === "admin" && <AdminPage onBackToStore={() => setPage("store")} />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Toaster position="bottom-right" />
    </>
  );
}
