import { useState } from "react";
import { Shield, ShieldCheck, ShieldOff, Copy, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  useSetup2FA,
  useVerifySetup2FA,
  useDisable2FA,
  useTwoFactorStatus,
  type TwoFactorSetupData,
} from "@/api/api_controllers/twoFactorController";

const labelStyle = { fontFamily: "Poppins", color: "#4c4c4c" };
const inputClass =
  "w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-text/20";
const inputStyle = {
  fontFamily: "Poppins",
  borderColor: "#e3e3e3",
  height: "40px",
};

type SetupStep = "idle" | "qr" | "verify" | "done";

const TwoFactorTab = () => {
  // ── Setup flow state ────────────────────────────────────────────────
  const [step, setStep] = useState<SetupStep>("idle");
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [verifyToken, setVerifyToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // ── Disable flow state ──────────────────────────────────────────────
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableToken, setDisableToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── API hooks ───────────────────────────────────────────────────────
  const { setup2FA, isLoading: setupLoading } = useSetup2FA();
  const { verifySetup, isLoading: verifyLoading } = useVerifySetup2FA();
  const { disable2FA, isLoading: disableLoading } = useDisable2FA();
  const { data: status, isPending: statusLoading, isError: statusError, refetch: refreshStatus } = useTwoFactorStatus();

  const handleSetup = async () => {
    try {
      const response = await setup2FA();
      const data = response?.data as TwoFactorSetupData;
      if (data?.qrCode) {
        setSetupData(data);
        setStep("qr");
      }
    } catch {

    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifySetup({ token: verifyToken });
      setStep("done");
      setVerifyToken("");
    } catch {

    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await disable2FA({ password: disablePassword, token: disableToken });

      setShowDisable(false);
      setDisablePassword("");
      setDisableToken("");
      setStep("idle");
      setSetupData(null);
    } catch {
     

    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div
      className="bg-card border border-border rounded-lg p-6"
      style={{ borderColor: "#e3e3e3", borderRadius: "12px", border: "none" }}
    >
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-sm mb-6"
        style={{ fontFamily: "Poppins" }}
      >
        <span className="text-muted-foreground">Settings</span>
        <span className="text-muted-foreground">{">"}</span>
        <span
          className="text-brand-text font-medium"
          style={{ color: "#f30100" }}
        >
          Two-Factor Authentication
        </span>
      </div>

      <div className="mb-6 text-sm" style={{ fontFamily: "Poppins" }} aria-live="polite">
        {statusLoading ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking 2FA status…
          </p>
        ) : statusError ? (
          <div className="flex items-center gap-3">
            <p className="text-red-600">Unable to load 2FA status.</p>
            <button type="button" onClick={() => void refreshStatus()} className="underline">Retry</button>
          </div>
        ) : status ? (
          <span className={`inline-flex rounded-full px-3 py-1 font-medium ${status.twoFactorEnabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {status.twoFactorEnabled ? "2FA enabled" : "2FA disabled"}
          </span>
        ) : null}
      </div>

      {/* ───────── IDLE — initial setup prompt ───────── */}
      {step === "idle" && !showDisable && !statusLoading && !statusError && status && (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#FFF0F0" }}
            >
              <Shield className="w-6 h-6" style={{ color: "#f30100" }} />
            </div>
            <div>
              <h2
                className="text-base font-medium"
                style={{ fontFamily: "Poppins", color: "#393939" }}
              >
                Two-Factor Authentication
              </h2>
              <p
                className="text-sm mt-1"
                style={{ fontFamily: "Poppins", color: "#777777" }}
              >
                {status.twoFactorEnabled
                  ? "Two-factor authentication is enabled. Use your authenticator app to generate a code each time you sign in."
                  : "Add an extra layer of security to your account by enabling two-factor authentication. You'll need an authenticator app like Google Authenticator or Authy."}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {!status.twoFactorEnabled && (
            <button
              type="button"
              onClick={handleSetup}
              disabled={setupLoading}
              className="text-sm text-white transition-colors px-6 py-2 disabled:opacity-60 flex items-center gap-2"
              style={{
                fontFamily: "Poppins",
                borderRadius: "8px",
                backgroundColor: "#f30100",
                border: "none",
                height: "40px",
              }}
            >
              {setupLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Enable 2FA
                </>
              )}
            </button>
            )}

            {status.twoFactorEnabled && (
            <button
              type="button"
              onClick={() => setShowDisable(true)}
              className="text-sm transition-colors px-6 py-2 flex items-center gap-2"
              style={{
                fontFamily: "Poppins",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "1px solid #e3e3e3",
                height: "40px",
                color: "#777777",
              }}
            >
              <ShieldOff className="w-4 h-4" />
              Disable 2FA
            </button>
            )}
          </div>
        </div>
      )}

      {/* ───────── QR CODE — scan step ───────── */}
      {step === "qr" && setupData && (
        <div className="space-y-6">
          <h2
            className="text-base font-medium"
            style={{ fontFamily: "Poppins", color: "#393939" }}
          >
            Step 1 — Scan QR Code
          </h2>
          <p
            className="text-sm"
            style={{ fontFamily: "Poppins", color: "#777777" }}
          >
            Open your authenticator app and scan the QR code below, or enter the
            secret key manually.
          </p>

          {/* QR image */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="p-4 rounded-xl inline-block"
              style={{ backgroundColor: "#f9f9f9", border: "1px solid #e3e3e3" }}
            >
              <img
                src={setupData.qrCode}
                alt="Two-Factor QR Code"
                className="w-48 h-48"
              />
            </div>

            {/* Manual entry secret */}
            <div
              className="w-full max-w-md p-4 rounded-lg"
              style={{ backgroundColor: "#f9f9f9", border: "1px solid #e3e3e3" }}
            >
              <p
                className="text-xs font-medium mb-2"
                style={{ fontFamily: "Poppins", color: "#777777" }}
              >
                Or enter this secret manually:
              </p>
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 text-sm font-mono px-3 py-2 rounded"
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #e3e3e3",
                    color: "#393939",
                    letterSpacing: "0.1em",
                  }}
                >
                  {showSecret ? setupData.secret : "••••••••••••••••"}
                </code>
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(setupData.secret)}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Copy secret"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Manual setup info */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs" style={{ fontFamily: "Poppins", color: "#999" }}>
                <span>Account: {setupData.manualSetup.account}</span>
                <span>Issuer: {setupData.manualSetup.issuer}</span>
                <span>Algorithm: {setupData.manualSetup.algorithm}</span>
                <span>Digits: {setupData.manualSetup.digits} / Period: {setupData.manualSetup.period}s</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep("verify")}
              className="text-sm text-white transition-colors px-6 py-2"
              style={{
                fontFamily: "Poppins",
                borderRadius: "8px",
                backgroundColor: "#f30100",
                border: "none",
                height: "40px",
              }}
            >
              I've scanned the code — Next
            </button>
          </div>
        </div>
      )}

      {/* ───────── VERIFY — enter TOTP to confirm setup ───────── */}
      {step === "verify" && (
        <form onSubmit={handleVerify} className="space-y-6">
          <h2
            className="text-base font-medium"
            style={{ fontFamily: "Poppins", color: "#393939" }}
          >
            Step 2 — Verify Setup
          </h2>
          <p
            className="text-sm"
            style={{ fontFamily: "Poppins", color: "#777777" }}
          >
            Enter the 6-digit code from your authenticator app to verify that
            two-factor authentication is working correctly.
          </p>

          <div className="max-w-xs">
            <label
              htmlFor="verify-token"
              className="block text-sm font-medium mb-2"
              style={labelStyle}
            >
              Authentication Code
            </label>
            <input
              id="verify-token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={verifyToken}
              onChange={(e) =>
                setVerifyToken(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              autoFocus
              className={inputClass}
              style={{
                ...inputStyle,
                letterSpacing: "0.3em",
                textAlign: "center",
                fontSize: "1.25rem",
              }}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("qr")}
              className="text-sm transition-colors px-6 py-2"
              style={{
                fontFamily: "Poppins",
                borderRadius: "8px",
                border: "1px solid #e3e3e3",
                height: "40px",
                color: "#777777",
                backgroundColor: "transparent",
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={verifyToken.length < 6 || verifyLoading}
              className="text-sm text-white transition-colors px-6 py-2 disabled:opacity-60 flex items-center gap-2"
              style={{
                fontFamily: "Poppins",
                borderRadius: "8px",
                backgroundColor: "#f30100",
                border: "none",
                height: "40px",
              }}
            >
              {verifyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify & Enable"
              )}
            </button>
          </div>
        </form>
      )}

      {/* ───────── DONE — success message ───────── */}
      {step === "done" && (
        <div className="space-y-6 text-center py-6">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full mx-auto"
            style={{ backgroundColor: "#ecfdf5" }}
          >
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2
            className="text-base font-medium"
            style={{ fontFamily: "Poppins", color: "#393939" }}
          >
            Two-Factor Authentication Enabled!
          </h2>
          <p
            className="text-sm max-w-md mx-auto"
            style={{ fontFamily: "Poppins", color: "#777777" }}
          >
            Your account is now secured with two-factor authentication. You'll
            be asked for a verification code each time you log in.
          </p>
          <button
            type="button"
            onClick={() => {
              setStep("idle");
              setSetupData(null);
            }}
            className="text-sm transition-colors px-6 py-2"
            style={{
              fontFamily: "Poppins",
              borderRadius: "8px",
              border: "1px solid #e3e3e3",
              height: "40px",
              color: "#777777",
              backgroundColor: "transparent",
            }}
          >
            Done
          </button>
        </div>
      )}

      {/* ───────── DISABLE 2FA form ───────── */}
      {showDisable && step === "idle" && (
        <form onSubmit={handleDisable} className="space-y-6">
          <div className="flex items-start gap-4">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#FFF0F0" }}
            >
              <ShieldOff className="w-6 h-6" style={{ color: "#f30100" }} />
            </div>
            <div>
              <h2
                className="text-base font-medium"
                style={{ fontFamily: "Poppins", color: "#393939" }}
              >
                Disable Two-Factor Authentication
              </h2>
              <p
                className="text-sm mt-1"
                style={{ fontFamily: "Poppins", color: "#777777" }}
              >
                Enter your account password and a verification code from your
                authenticator app to disable 2FA.
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            {/* Password */}
            <div>
              <label
                htmlFor="disable-password"
                className="block text-sm font-medium mb-2"
                style={labelStyle}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="disable-password"
                  type={showPassword ? "text" : "password"}
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={inputClass}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* TOTP token */}
            <div>
              <label
                htmlFor="disable-token"
                className="block text-sm font-medium mb-2"
                style={labelStyle}
              >
                Authentication Code
              </label>
              <input
                id="disable-token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={disableToken}
                onChange={(e) =>
                  setDisableToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                className={inputClass}
                style={{
                  ...inputStyle,
                  letterSpacing: "0.3em",
                  textAlign: "center",
                  fontSize: "1.25rem",
                  maxWidth: "180px",
                }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowDisable(false);
                setDisablePassword("");
                setDisableToken("");
              }}
              className="text-sm transition-colors px-6 py-2"
              style={{
                fontFamily: "Poppins",
                borderRadius: "8px",
                border: "1px solid #e3e3e3",
                height: "40px",
                color: "#777777",
                backgroundColor: "transparent",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                disablePassword.length === 0 ||
                disableToken.length < 6 ||
                disableLoading
              }
              className="text-sm text-white transition-colors px-6 py-2 disabled:opacity-60 flex items-center gap-2"
              style={{
                fontFamily: "Poppins",
                borderRadius: "8px",
                backgroundColor: "#f30100",
                border: "none",
                height: "40px",
              }}
            >
              {disableLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Disabling…
                </>
              ) : (
                "Disable 2FA"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TwoFactorTab;
