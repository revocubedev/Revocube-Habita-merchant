
import axios, { AxiosError } from "axios";

// ==========================================
// API CONFIGURATION
// ==========================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is missing from environment variables");
}

// Public API for endpoints that don't require authentication (no withCredentials)
export const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
    },
    withCredentials: false,
});

// Request interceptor for publicApi (no token)
publicApi.interceptors.request.use(
    (config: any) => {
        console.log("=== PUBLIC API REQUEST ===");
        console.log("URL:", config.url);
        console.log("Method:", config.method);
        console.log("Base URL:", config.baseURL);
        console.log("Full URL:", `${config.baseURL}${config.url}`);
        console.log("Headers:", config.headers);
        console.log("Data:", config.data);
        console.log("withCredentials:", false);

        return config;
    },
    (error: any) => {
        console.log("=== PUBLIC API REQUEST ERROR ===");
        console.log("Error:", error);
        return Promise.reject(error);
    }
);

// Authenticated API for endpoints that require Bearer token
export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
    },
    withCredentials: true,
});

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
    (config: any) => {
        config.headers = config.headers || {};
        const token = localStorage.getItem("token");

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        console.log("=== REQUEST INTERCEPTOR ===");
        console.log("URL:", config.url);
        console.log("Method:", config.method);
        console.log("Base URL:", config.baseURL);
        console.log("Full URL:", `${config.baseURL}${config.url}`);
        console.log("Headers:", config.headers);
        console.log("Data:", config.data);
        console.log("Token:", token ? "exists" : "none");

        return config;
    },
    (error: any) => {
        console.log("=== REQUEST INTERCEPTOR ERROR ===");
        console.log("Error:", error);
        return Promise.reject(error);
    }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(
    (response: any) => response,
    (error: AxiosError<{ message?: string; error?: string }>) => {
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "An unexpected error occurred";

        console.error("API Error:", message);

        return Promise.reject(error);
    }
);

// ==========================================
// COMMON ERROR HANDLER
// ==========================================

export const getApiErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string; error?: string }>;
        return (
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message ||
            "An unexpected error occurred"
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "An unexpected error occurred";
};

// ==========================================
// ESTATE MANAGER AUTHENTICATION
// ==========================================

export interface EstateManagerLoginPayload {
    email: string;
    password: string;
}

export interface EstateManagerLoginResponse {
    success?: boolean;
    message?: string;
    token?: string;
    data?: {
        token?: string;
        manager?: Record<string, unknown>;
        name?: string;
        email?: string;
        [key: string]: unknown;
    };
    manager?: Record<string, unknown>;
    [key: string]: unknown;
}

export const loginEstateManager = async (
    payload: EstateManagerLoginPayload
): Promise<EstateManagerLoginResponse> => {
    console.log("=== LOGIN REQUEST ===");
    console.log("Endpoint:", "/estate-managers/login");
    console.log("Base URL:", BASE_URL);
    console.log("Full URL:", `${BASE_URL}/estate-managers/login`);
    console.log("Payload:", payload);

    try {
        const response = await publicApi.post<EstateManagerLoginResponse>(
            "/estate-managers/login",
            payload
        );

        console.log("=== LOGIN RESPONSE ===");
        console.log("Status:", response.status);
        console.log("Headers:", response.headers);
        console.log("Data:", response.data);

        return response.data;
    } catch (error) {
        console.log("=== LOGIN ERROR ===");
        if (axios.isAxiosError(error)) {
            console.log("Error Code:", error.code);
            console.log("Error Message:", error.message);
            console.log("Error Status:", error.response?.status);
            console.log("Error Status Text:", error.response?.statusText);
            console.log("Error Headers:", error.response?.headers);
            console.log("Error Data:", error.response?.data);
            console.log("Error Config:", {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data,
                baseURL: error.config?.baseURL,
            });
        } else {
            console.log("Non-Axios Error:", error);
        }
        throw error;
    }
};

// ==========================================
// EXPORTS
// ==========================================

export { axios };
