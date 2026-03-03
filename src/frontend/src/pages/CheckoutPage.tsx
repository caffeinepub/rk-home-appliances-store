import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Copy,
  Loader2,
  LogIn,
  Package,
  ShoppingBag,
  Smartphone,
  Store,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProducts,
  useCart,
  useClearCart,
  usePlaceOrder,
} from "../hooks/useQueries";
import { getProductImage } from "../utils/productImages";

interface CheckoutPageProps {
  onBackToStore: () => void;
  onMyOrders: () => void;
}

type PaymentMethod = "cod" | "upi" | "pickup";

const PAYMENT_METHODS = [
  {
    id: "cod" as PaymentMethod,
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: Banknote,
  },
  {
    id: "upi" as PaymentMethod,
    label: "UPI / Bank Transfer",
    description: "Pay via UPI or bank transfer",
    icon: Smartphone,
  },
  {
    id: "pickup" as PaymentMethod,
    label: "Pay on Pickup",
    description: "Pick up and pay at our store",
    icon: Store,
  },
];

const UPI_DETAILS = {
  upiId: "rkhomeappliances@upi",
  bankName: "State Bank of India",
  accountNumber: "XXXX XXXX 4521",
  ifsc: "SBIN0001234",
  accountName: "RK Home Appliances",
};

export default function CheckoutPage({
  onBackToStore,
  onMyOrders,
}: CheckoutPageProps) {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const placeOrder = usePlaceOrder();
  const clearCart = useClearCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [upiReference, setUpiReference] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedOrderId, setConfirmedOrderId] = useState<bigint | null>(null);

  const isLoading = cartLoading || productsLoading;

  // Build enriched cart
  const enrichedCart = (cartItems ?? []).map((item) => {
    const product = products?.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const subtotal = enrichedCart.reduce(
    (acc, item) => acc + (item.product?.price ?? 0) * Number(item.quantity),
    0,
  );

  const totalItems = enrichedCart.reduce(
    (acc, item) => acc + Number(item.quantity),
    0,
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.customerName = "Name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim()))
      newErrors.phone = "Enter a valid phone number";
    if (!deliveryAddress.trim())
      newErrors.deliveryAddress = "Delivery address is required";
    if (paymentMethod === "upi" && !upiReference.trim())
      newErrors.upiReference = "Transaction reference is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const orderItems = enrichedCart
      .filter((item) => item.product)
      .map((item) => ({
        productId: item.productId,
        productName: item.product!.name,
        quantity: item.quantity,
        unitPrice: item.product!.price,
      }));

    const paymentLabels: Record<PaymentMethod, string> = {
      cod: "Cash on Delivery",
      upi: "UPI / Bank Transfer",
      pickup: "Pay on Pickup",
    };

    placeOrder.mutate(
      {
        customerName: customerName.trim(),
        phone: phone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod: paymentLabels[paymentMethod],
        upiReference: paymentMethod === "upi" ? upiReference.trim() : "",
        items: orderItems,
      },
      {
        onSuccess: (orderId) => {
          clearCart.mutate(undefined, {
            onSuccess: () => {
              setConfirmedOrderId(orderId);
              toast.success("Order placed successfully!");
            },
            onError: () => {
              setConfirmedOrderId(orderId);
              toast.success("Order placed successfully!");
            },
          });
        },
        onError: () => {
          toast.error("Failed to place order. Please try again.");
        },
      },
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied!`);
    });
  };

  // Not authenticated
  if (!isInitializing && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-nav">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-16 gap-4">
              <button
                type="button"
                onClick={onBackToStore}
                data-ocid="checkout.back_to_store.button"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Store</span>
              </button>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-foreground">
                  Checkout
                </span>
              </div>
            </div>
          </div>
        </header>
        <div
          className="flex-1 flex items-center justify-center p-4"
          data-ocid="checkout.login_required.section"
        >
          <motion.div
            className="text-center max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Login to Checkout
            </h2>
            <p className="text-muted-foreground font-body text-sm mb-6">
              Please log in to place your order and track delivery.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="checkout.login.primary_button"
              className="w-full gap-2 bg-primary text-primary-foreground"
              size="lg"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn ? "Logging in..." : "Log In to Continue"}
            </Button>
            <button
              type="button"
              onClick={onBackToStore}
              className="mt-3 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="checkout.back_to_store_link.button"
            >
              ← Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Order confirmed
  if (confirmedOrderId !== null) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-nav">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-16 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-foreground">
                  Order Confirmed
                </span>
              </div>
            </div>
          </div>
        </header>
        <div
          className="flex-1 flex items-center justify-center p-4"
          data-ocid="checkout.order_confirmed.section"
        >
          <motion.div
            className="text-center max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </motion.div>

              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Order Placed!
              </h2>
              <p className="text-muted-foreground font-body text-sm mb-6">
                Thank you for your order. We'll contact you shortly to confirm
                delivery details.
              </p>

              <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                <p className="text-xs text-muted-foreground font-body mb-1">
                  Order ID
                </p>
                <p className="font-display font-bold text-foreground text-lg">
                  #ORD-{confirmedOrderId.toString().padStart(6, "0")}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={onMyOrders}
                  data-ocid="checkout.view_my_orders.button"
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Package className="w-4 h-4" />
                  View My Orders
                </Button>
                <Button
                  onClick={onBackToStore}
                  data-ocid="checkout.continue_shopping.button"
                  className="w-full gap-2 bg-primary text-primary-foreground"
                  size="lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 gap-4">
            <button
              type="button"
              onClick={onBackToStore}
              data-ocid="checkout.back_to_store.button"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Store</span>
            </button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">
                Checkout
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left: Order Summary */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Order Summary
                </h2>
                {!isLoading && (
                  <Badge variant="secondary" className="font-body">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {isLoading && (
                <div
                  data-ocid="checkout.summary.loading_state"
                  className="p-5 space-y-4"
                >
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && enrichedCart.length === 0 && (
                <div
                  data-ocid="checkout.summary.empty_state"
                  className="p-10 text-center"
                >
                  <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-display font-semibold text-foreground">
                    Cart is empty
                  </p>
                  <p className="text-muted-foreground text-sm font-body mt-1">
                    Add products before checkout.
                  </p>
                  <Button
                    variant="outline"
                    onClick={onBackToStore}
                    className="mt-4"
                    data-ocid="checkout.back_from_empty.button"
                  >
                    Back to Store
                  </Button>
                </div>
              )}

              {!isLoading && enrichedCart.length > 0 && (
                <div className="p-5 space-y-3">
                  {enrichedCart.map((item, index) => {
                    const product = item.product;
                    if (!product) return null;
                    const imgSrc = getProductImage(
                      product.name,
                      product.category,
                    );
                    return (
                      <div
                        key={item.productId.toString()}
                        className="flex gap-3 p-3 bg-background rounded-lg border border-border"
                        data-ocid={`checkout.summary.item.${index + 1}`}
                      >
                        <div className="w-14 h-14 rounded-lg bg-secondary/30 flex-shrink-0 overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-sm text-foreground line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-body mt-0.5">
                            {product.category}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-muted-foreground font-body">
                              Qty: {Number(item.quantity)}
                            </span>
                            <span className="font-display font-bold text-sm text-foreground">
                              ₹
                              {(
                                product.price * Number(item.quantity)
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <Separator className="my-4" />

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-body text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm font-body text-muted-foreground">
                      <span>Delivery</span>
                      <span className="text-emerald-600 font-medium">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-display font-bold text-lg text-foreground pt-1">
                      <span>Total</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Checkout Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="p-5 border-b border-border">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Delivery Details
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Customer Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="customerName"
                    className="font-body text-sm font-medium text-foreground"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="customerName"
                    type="text"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    data-ocid="checkout.customer_name.input"
                    className="font-body"
                    autoComplete="name"
                  />
                  {errors.customerName && (
                    <p
                      className="text-destructive text-xs font-body"
                      data-ocid="checkout.customer_name.error_state"
                    >
                      {errors.customerName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="font-body text-sm font-medium text-foreground"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-ocid="checkout.phone.input"
                    className="font-body"
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <p
                      className="text-destructive text-xs font-body"
                      data-ocid="checkout.phone.error_state"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="deliveryAddress"
                    className="font-body text-sm font-medium text-foreground"
                  >
                    Delivery Address
                  </Label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="House no., street, area, city, state, PIN"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    data-ocid="checkout.delivery_address.textarea"
                    className="font-body min-h-[80px] resize-none"
                    autoComplete="street-address"
                  />
                  {errors.deliveryAddress && (
                    <p
                      className="text-destructive text-xs font-body"
                      data-ocid="checkout.delivery_address.error_state"
                    >
                      {errors.deliveryAddress}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium text-foreground">
                    Payment Method
                  </Label>
                  <div
                    className="space-y-2"
                    data-ocid="checkout.payment_method.select"
                  >
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      return (
                        <button
                          type="button"
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          data-ocid={`checkout.payment.${method.id}.radio`}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-background hover:border-primary/40"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-display font-semibold text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {method.label}
                            </p>
                            <p className="text-xs font-body text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* UPI Details */}
                {paymentMethod === "upi" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-body font-semibold text-blue-800 uppercase tracking-wide">
                        Payment Details
                      </p>

                      <div className="space-y-2">
                        {[
                          { label: "UPI ID", value: UPI_DETAILS.upiId },
                          {
                            label: "Account Name",
                            value: UPI_DETAILS.accountName,
                          },
                          { label: "Bank", value: UPI_DETAILS.bankName },
                          {
                            label: "Account No.",
                            value: UPI_DETAILS.accountNumber,
                          },
                          { label: "IFSC", value: UPI_DETAILS.ifsc },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-xs text-blue-700 font-body">
                              {label}:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-display font-semibold text-blue-900">
                                {value}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(value, label)}
                                className="p-0.5 hover:text-blue-700 text-blue-500 transition-colors"
                                data-ocid={`checkout.upi.copy_${label.toLowerCase().replace(/[. ]/g, "_")}.button`}
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="upiReference"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        Transaction Reference Number
                      </Label>
                      <Input
                        id="upiReference"
                        type="text"
                        placeholder="Enter UPI/bank reference number"
                        value={upiReference}
                        onChange={(e) => setUpiReference(e.target.value)}
                        data-ocid="checkout.upi_reference.input"
                        className="font-body"
                      />
                      {errors.upiReference && (
                        <p
                          className="text-destructive text-xs font-body"
                          data-ocid="checkout.upi_reference.error_state"
                        >
                          {errors.upiReference}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-body">
                        Enter the reference/transaction ID after completing
                        payment.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Place Order Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={
                      placeOrder.isPending ||
                      clearCart.isPending ||
                      enrichedCart.length === 0
                    }
                    data-ocid="checkout.place_order.submit_button"
                    className="w-full bg-primary text-primary-foreground gap-2"
                    size="lg"
                  >
                    {placeOrder.isPending || clearCart.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        Place Order · ₹{subtotal.toLocaleString("en-IN")}
                      </>
                    )}
                  </Button>
                  {placeOrder.isError && (
                    <p
                      className="text-destructive text-xs font-body text-center mt-2"
                      data-ocid="checkout.place_order.error_state"
                    >
                      Failed to place order. Please try again.
                    </p>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm font-body">
            © {new Date().getFullYear()}.{" "}
            <span className="font-medium text-foreground">
              RK Home Appliances
            </span>
            . Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
