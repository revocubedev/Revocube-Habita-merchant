import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import Card, { CardContent } from "@/components/ui/Card";
import { BILLING_CYCLES, BillingCycle, useInitializePayment } from "@/api/api_controllers/paymentController";


interface StoredEstate {
  id: string;
  name?: string;
  estateCode?: string;
  status?: string;
  package?: { id?: string; name?: string } | null;
}

// Saved by the login page: the estates the signed-in manager belongs to
const readEstates = (): StoredEstate[] => {
  try {
    const raw = localStorage.getItem("estates");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((e) => e && typeof e.id === "string")
      : [];
  } catch {
    return [];
  }
};

const labelStyle = { fontFamily: "Poppins", color: "#4c4c4c" };

const InitiatePayment = () => {
  const estates = useMemo(readEstates, []);
  const activeCode = localStorage.getItem("code");

  const [estateId, setEstateId] = useState(
    () =>
      (estates.find((e) => e.estateCode === activeCode) ?? estates[0])?.id ?? ""
  );
  const [cycle, setCycle] = useState<BillingCycle>("MONTHLY");
  const [redirecting, setRedirecting] = useState(false);

  const { initializePayment, isLoading } = useInitializePayment();
  const estate = estates.find((e) => e.id === estateId);
  const busy = isLoading || redirecting;

  const handlePay = async () => {
    if (!estateId || busy) return;

    try {
      const result = await initializePayment({
        estateId,
        billingCycle: cycle,
        callbackUrl: `${window.location.origin}/verify-payment`,
      });

      if (!result?.authorizationUrl) {
        throw new Error("Payment authorization URL was not returned.");
      }

      try {
        if (result.reference) {
          sessionStorage.setItem("pendingPaymentReference", result.reference);
        }
      } catch {
        // Storage unavailable; continue using the authorization URL.
      }

      setRedirecting(true);
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      console.error("Payment initialization failed:", error);
      setRedirecting(false);
    }
  };

  return (
    <div className="space-y-4" style={{ fontFamily: "Poppins" }}>
      <h1
        className="text-2xl font-display font-semibold text-foreground"
        style={{ fontWeight: 600, color: "#393939" }}
      >
        Subscription Payment
      </h1>

      <Card
        className="bg-card border border-border max-w-xl"
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent className="p-6 space-y-6">
          {estates.length === 0 ? (
            <p className="text-sm" style={{ color: "#f30100" }}>
              No estate found for your account. Please log out and sign in
              again.
            </p>
          ) : (
            <>
              <div>
                <label
                  htmlFor="payment-estate"
                  className="block text-sm font-medium mb-2"
                  style={labelStyle}
                >
                  Estate
                </label>
                {estates.length === 1 ? (
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#393939" }}
                  >
                    {estate?.name ?? estate?.estateCode}
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      id="payment-estate"
                      value={estateId}
                      onChange={(e) => setEstateId(e.target.value)}
                      disabled={busy}
                      className="w-full px-4 rounded-lg border bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 disabled:opacity-60"
                      style={{
                        fontFamily: "Poppins",
                        borderColor: "#e3e3e3",
                        height: "48px",
                      }}
                    >
                      {estates.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name ?? e.estateCode}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                )}
                {estate?.package?.name && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    Current package: {estate.package.name}
                  </p>
                )}
              </div>

              <div>
                <span
                  className="block text-sm font-medium mb-2"
                  style={labelStyle}
                >
                  Billing cycle
                </span>
                <div
                  role="radiogroup"
                  aria-label="Billing cycle"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {BILLING_CYCLES.map((option) => {
                    const selected = option.value === cycle;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={busy}
                        onClick={() => setCycle(option.value)}
                        className="px-4 py-3 text-sm rounded-lg border transition-colors disabled:opacity-60"
                        style={{
                          fontFamily: "Poppins",
                          borderColor: selected ? "#f30100" : "#e3e3e3",
                          backgroundColor: selected ? "#FFF0F0" : "white",
                          color: selected ? "#f30100" : "#4c4c4c",
                          fontWeight: selected ? 600 : 400,
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                You'll be redirected to our payment partner to complete the
                payment securely.
              </p>

              <button
                type="button"
                onClick={handlePay}
                disabled={!estateId || busy}
                className="w-full text-white transition-colors disabled:opacity-60"
                style={{
                  borderRadius: "12px",
                  backgroundColor: "#f30100",
                  border: "none",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                {redirecting
                  ? "Redirecting to checkout..."
                  : isLoading
                  ? "Starting payment..."
                  : "Proceed to payment"}
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InitiatePayment;
