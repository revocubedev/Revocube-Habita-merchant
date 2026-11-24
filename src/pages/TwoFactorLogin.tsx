import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useVerify2FALogin } from "@/api/api_controllers/twoFactorController";
import { useAuth } from "@/lib/auth";
import type { User } from "@/types";
import { estatePath } from "@/lib/estateRoutes";

const TwoFactorLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const challenge = location.state as { challengeToken: string; expiresIn: number } | null;
  const challengeToken = challenge?.challengeToken;

  const [token, setToken] = useState("");
  const { verify2FALogin, isLoading } = useVerify2FALogin();

  // If someone navigates here directly without a challengeToken, redirect
  if (!challengeToken) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/assets/bgauthimg.png)",
          fontFamily: "Poppins",
        }}
      >
        <div
          className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl text-center"
          style={{ borderRadius: "24px" }}
        >
          <p className="text-sm mb-4" style={{ color: "#777777" }}>
            No authentication challenge found. Please log in first.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-white px-6 py-2"
            style={{
              fontFamily: "Poppins",
              borderRadius: "12px",
              backgroundColor: "#f30100",
              border: "none",
              height: "40px",
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await verify2FALogin({ challengeToken, token });
      const { manager, estates } = response.data;

      const accessToken = response.data.token;
      if (!accessToken) {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: "No authentication token received",
          confirmButtonColor: "#f30100",
        });
        return;
      }

      const estateCode: string | undefined = estates[0]?.estateCode;
      if (!estateCode) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "No estate is linked to this account",
          confirmButtonColor: "#f30100",
        });
        return;
      }

      const userData: User = {
        id: manager.id,
        name: `${manager.firstName} ${manager.lastName}`.trim(),
        email: manager.email,
        role: "",
      };

      localStorage.setItem("est_code", estateCode);
      localStorage.setItem("estates", JSON.stringify(estates));
      login(accessToken, userData);

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        confirmButtonColor: "#f30100",
        timer: 1500,
        timerProgressBar: true,
      });

      navigate(estatePath(estateCode));
    } catch {
      // useApiManager already showed the error toast
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url(/assets/bgauthimg.png)",
        fontFamily: "Poppins",
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl"
        style={{ borderRadius: "24px" }}
      >
        <div className="mb-8">
          <img
            src="/assets/spacesl.png"
            alt="Revocube Spaces Logo"
            className="h-12 w-auto"
          />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: "#FFF0F0" }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: "#f30100" }} />
          </div>
          <h2
            className="text-2xl font-semibold"
            style={{ fontFamily: "Poppins", color: "#393939" }}
          >
            Two-Factor Verification
          </h2>
        </div>
        <p
          className="text-sm mb-6"
          style={{ fontFamily: "Poppins", color: "#777777" }}
        >
          Enter the 6-digit code from your authenticator app to complete sign in.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
            >
              Authentication Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={token}
              onChange={(e) =>
                setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
              style={{
                fontFamily: "Poppins",
                borderColor: "#e3e3e3",
                height: "48px",
                letterSpacing: "0.3em",
                textAlign: "center",
                fontSize: "1.25rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={token.length < 6 || isLoading}
            className="w-full text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              fontFamily: "Poppins",
              borderRadius: "12px",
              backgroundColor: "#f30100",
              border: "none",
              height: "48px",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify & Login"
            )}
          </button>
        </form>

        <p
          className="mt-6 text-center text-sm"
          style={{ fontFamily: "Poppins", color: "#777777" }}
        >
          Didn't receive a code?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium"
            style={{ color: "#f30100", background: "none", border: "none", cursor: "pointer" }}
          >
            Sign in again
          </button>
        </p>
      </div>
    </div>
  );
};

export default TwoFactorLogin;
