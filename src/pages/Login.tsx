import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import useApiManager from "@/api/useApiManager"; // adjust to where your hook lives
import { useAuth } from "@/lib/auth";
import type { User } from "@/types";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Errors are toasted by the hook (sonner), so no onError needed here
  const { callApi: loginRequest, isLoading } = useApiManager({
    endpoint: "/estate-managers/login",
    method: "POST",
    isAuth: false,
    isCode: false,
    showSuccessToastt: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await loginRequest({ email, password });

      const token: string = response?.data?.token || response?.token || "";
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "No authentication token received",
          confirmButtonColor: "#f30100",
        });
        return;
      }

      const managerData = response?.data?.manager || response?.manager;
      const estates: any[] = response?.data?.estates || [];
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
        id: managerData?.id || "",
        name:
          [managerData?.firstName, managerData?.lastName]
            .filter(Boolean)
            .join(" ") || "Estate Manager",
        email: managerData?.email || email,
        role: managerData?.role || "Admin",
      };

      // Set before navigating: hooks read "code" from localStorage
      localStorage.setItem("code", estateCode);
      localStorage.setItem("estates", JSON.stringify(estates));
      login(token, userData);

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        confirmButtonColor: "#f30100",
        timer: 1500,
        timerProgressBar: true,
      });
      navigate("/");
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
          Please enter your details to sign in
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

export default Login;
