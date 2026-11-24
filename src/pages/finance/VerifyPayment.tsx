import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import Card, { CardContent } from "@/components/ui/Card";
import { useVerifyPayment } from "@/api/api_controllers/paymentController";

const PENDING_KEY = "pendingPaymentReference";
const NOT_PAID = ["PENDING", "FAILED", "ABANDONED", "CANCELLED"];

type Status = "idle" | "verifying" | "success" | "failed";

const readPending = (): string => {
  try {
    return sessionStorage.getItem(PENDING_KEY) ?? "";
  } catch {
    return "";
  }
};

const VerifyPayment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();

  // Paystack sends the user back with ?reference=... (and ?trxref=...)
  const fromUrl = params.get("reference") ?? params.get("trxref") ?? "";
  const [manual, setManual] = useState("");
  const reference = (fromUrl || readPending() || manual).trim();
  const hasKnownReference = Boolean(fromUrl || readPending());

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const { refetch } = useVerifyPayment(reference);

  const handleVerify = async () => {
    if (!reference || status === "verifying") return;
    setStatus("verifying");
    setMessage("");

    const result = await refetch();

    if (result.isError) {
      setStatus("failed");
      setMessage(
        (result.error as Error)?.message ||
          "We couldn't verify this payment. Please try again."
      );
      return;
    }

    const body: any = result.data;
    const paymentStatus = String(body?.data?.status ?? "").toUpperCase();

    if (body?.success === false || NOT_PAID.includes(paymentStatus)) {
      setStatus("failed");
      setMessage(body?.message || "This payment has not been completed.");
      return;
    }

    try {
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      // ignore
    }
    queryClient.invalidateQueries(); // subscription state may have changed
    setMessage(body?.message || "Payment verified successfully.");
    setStatus("success");
  };

  // After a successful verification, go to the dashboard
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => navigate("/", { replace: true }), 2000);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <div className="space-y-4" style={{ fontFamily: "Poppins" }}>
      <h1
        className="text-2xl font-display font-semibold text-foreground"
        style={{ fontWeight: 600, color: "#393939" }}
      >
        Verify Payment
      </h1>

      <Card
        className="bg-card border border-border max-w-xl"
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent className="p-6 space-y-6">
          {status === "success" ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <CheckCircle2
                className="w-14 h-14"
                style={{ color: "#27964F" }}
              />
              <p className="text-lg font-medium" style={{ color: "#393939" }}>
                {message}
              </p>
              <p className="text-sm text-muted-foreground">
                Taking you to your dashboard...
              </p>
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className="text-sm underline"
                style={{ color: "#f30100" }}
              >
                Go to dashboard now
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm" style={{ color: "#4c4c4c" }}>
                Confirm your payment to activate your subscription.
              </p>

              {hasKnownReference ? (
                <div>
                  <span className="block text-xs mb-1 text-muted-foreground">
                    Payment reference
                  </span>
                  <p
                    className="text-sm font-medium break-all"
                    style={{ color: "#393939" }}
                  >
                    {reference}
                  </p>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="payment-reference"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#4c4c4c" }}
                  >
                    Payment reference
                  </label>
                  <input
                    id="payment-reference"
                    type="text"
                    placeholder="e.g. EST-xxxxxxxx-xxxx"
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    className="w-full px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f30100]/20"
                    style={{
                      fontFamily: "Poppins",
                      borderColor: "#e3e3e3",
                      height: "48px",
                    }}
                  />
                  <p className="text-xs mt-2 text-muted-foreground">
                    We couldn't find a reference automatically. Enter the one
                    from your payment receipt.
                  </p>
                </div>
              )}

              {status === "failed" && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg p-3 text-sm"
                  style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
                >
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerify}
                disabled={!reference || status === "verifying"}
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
                {status === "verifying"
                  ? "Verifying..."
                  : status === "failed"
                  ? "Verify again"
                  : "Verify payment"}
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPayment;
