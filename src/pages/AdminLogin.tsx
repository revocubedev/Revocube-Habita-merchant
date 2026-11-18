import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import useApiManager from "@/api/useApiManager";
import { useAuth } from "@/lib/auth";
import type { User } from "@/types";
import { estatePath } from "@/lib/estateRoutes";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [estateCode, setEstateCode] = useState(
    localStorage.getItem("code") || ""
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { callApi: loginRequest, isLoading } = useApiManager({
    endpoint: "/estate/login",
    method: "POST",
    isAuth: false,
    isCode: true,
    estateCode: estateCode.trim(),
    showSuccessToastt: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!estateCode.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Estate Code Required",
        text: "Please enter your estate code.",
        confirmButtonColor: "#f30100",
      });
      return;
    }

    try {
      const response = await loginRequest({ email, password });

      console.log("ADMIN LOGIN RESPONSE:", response);

      const payload = response?.data ?? response;
      const token: string = payload?.token || "";

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "No authentication token received",
          confirmButtonColor: "#f30100",
        });
        return;
      }

      const managerData = payload?.manager;
      const estates: any[] = payload?.estates || [];

      // Use the estate returned by the API, or the entered code.
      const activeEstateCode = estates[0]?.estateCode || estateCode.trim();

      const userData: User = {
        id: managerData?.id || "",
        name:
          [managerData?.firstName, managerData?.lastName]
            .filter(Boolean)
            .join(" ") || "Estate Manager",
        email: managerData?.email || email,
        role: managerData?.role || "Admin",
      };

      localStorage.setItem("code", activeEstateCode);
      localStorage.setItem("estates", JSON.stringify(estates));

      login(token, userData);

      const destination = estatePath(activeEstateCode);

      console.log("ESTATE CODE:", activeEstateCode);
      console.log("REDIRECT URL:", destination);

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        confirmButtonColor: "#f30100",
        timer: 1500,
        timerProgressBar: true,
      });

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);
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

        <h2
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: "Poppins", color: "#393939" }}
        >
          Welcome back!
        </h2>

        <p
          className="text-sm mb-6"
          style={{ fontFamily: "Poppins", color: "#777777" }}
        >
          Please enter your estate code and login details
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
            >
              Estate Code
            </label>

            <input
              type="text"
              placeholder="Enter your estate code"
              value={estateCode}
              onChange={(e) => setEstateCode(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
              style={{
                fontFamily: "Poppins",
                borderColor: "#e3e3e3",
                height: "48px",
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
            >
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
              style={{
                fontFamily: "Poppins",
                borderColor: "#e3e3e3",
                height: "48px",
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
              style={{
                fontFamily: "Poppins",
                borderColor: "#e3e3e3",
                height: "48px",
              }}
            />
          </div>

          <div className="flex justify-end">
            <a
              href="#"
              className="text-sm"
              style={{ fontFamily: "Poppins", color: "#f30100" }}
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white transition-colors disabled:opacity-60"
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
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p
          className="mt-6 text-center text-sm"
          style={{ fontFamily: "Poppins", color: "#777777" }}
        >
          Don't have an account?{" "}
          <a href="#" className="font-medium" style={{ color: "#f30100" }}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
