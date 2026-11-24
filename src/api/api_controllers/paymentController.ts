import { toast } from "sonner";
import useApiManager from "../useApiManager";
import useGetApiManager from "../useGetApiManager";

// Confirm the accepted values with your backend. Only MONTHLY is confirmed so far.
export const BILLING_CYCLES = [
  { value: "MONTHLY", label: "Monthly" },
  // { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
] as const;

export type BillingCycle = (typeof BILLING_CYCLES)[number]["value"];

export interface InitializePaymentPayload {
  estateId: string;
  billingCycle: BillingCycle;
  callbackUrl?: string;
}

export interface InitializePaymentResult {
  subscriptionId: string;
  reference: string;
  amount: number;
  currency: string;
  authorizationUrl: string;
}

// POST /payments/initialize (no estate code in this route)
export const useInitializePayment = () => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: "payments/initialize",
    method: "POST",
    isAuth: true,
    isCode: false,
    showSuccessToastt: false, // the user is redirected straight to checkout
  });

  const initializePayment = async (
    details: InitializePaymentPayload
  ): Promise<InitializePaymentResult> => {
    const response = await callApi(details);
    const data = response?.data as InitializePaymentResult | undefined;

    // Only ever send the user to an https checkout page
    let secure = false;
    try {
      secure = new URL(data?.authorizationUrl ?? "").protocol === "https:";
    } catch {
      secure = false;
    }

    if (!data || !secure) {
      const message = "Payment could not be started. Please try again.";
      toast.error(message);
      throw new Error(message);
    }
    return data;
  };

  return { initializePayment, isLoading, error, isSuccess };
};


export const useVerifyPayment = (reference?: string) =>
  useGetApiManager({
    queryKey: ["verify_payment", reference ?? ""],
    isAuth: true,
    isCode: false,
    endpoint: "payments/verify",
    enabled: false,
    retry: false, // a failed verification shouldn't be retried three times in the background
    params: { reference },
  });