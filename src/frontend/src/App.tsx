import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import CartDrawer from "./components/CartDrawer";
import AdminPage from "./pages/AdminPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import StorePage from "./pages/StorePage";

type Page = "store" | "admin" | "checkout" | "myorders";

export default function App() {
  const [page, setPage] = useState<Page>("store");
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      {page === "store" && (
        <StorePage
          onNavigateAdmin={() => setPage("admin")}
          onOpenCart={() => setCartOpen(true)}
          onMyOrders={() => setPage("myorders")}
        />
      )}
      {page === "admin" && <AdminPage onBackToStore={() => setPage("store")} />}
      {page === "checkout" && (
        <CheckoutPage
          onBackToStore={() => setPage("store")}
          onMyOrders={() => setPage("myorders")}
        />
      )}
      {page === "myorders" && (
        <MyOrdersPage onBackToStore={() => setPage("store")} />
      )}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setPage("checkout");
        }}
      />
      <Toaster position="bottom-right" />
    </>
  );
}
