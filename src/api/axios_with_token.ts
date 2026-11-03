import axios from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { baseURL } from "./axios_without_token";

// Set this to your backend's refresh route. Leave null if there isn't one:
// a 401 will then log the user out instead of attempting a refresh.
const REFRESH_ENDPOINT: string | null = null; // e.g. "/estate-managers/refresh"

export const getRedirectUrl = () => "/login";

const getStoredToken = (): string | null => {
  const raw = localStorage.getItem("token");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const decodeJwt = (token: string): { exp?: number } | null => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const isTokenExpiredOrExpiringSoon = (token: string, bufferSeconds = 10) => {
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return false;
  return decoded.exp - Date.now() / 1000 < bufferSeconds;
};

export const axiosPlain = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "ngrok-skip-browser-warning": "true" },
});

const axiosAuth = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Single shared refresh lock used by both interceptors
let refreshPromise: Promise<string> | null = null;

const doRefresh = async (): Promise<string> => {
  if (!REFRESH_ENDPOINT) throw new Error("No refresh endpoint configured");

  const { data } = await axiosPlain.get(REFRESH_ENDPOINT);
  const newToken = data?.accessToken;
  if (!newToken)
    throw new Error("No access token returned from refresh endpoint");

  localStorage.setItem("token", newToken);
  window.dispatchEvent(
    new CustomEvent("authTokenRefreshed", { detail: { token: newToken } })
  );
  return newToken;
};

const getRefreshedToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const handleRefreshFailure = () => {
  localStorage.removeItem("token");
  window.location.href = getRedirectUrl();
};

axiosAuth.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = getStoredToken();

    if (token && REFRESH_ENDPOINT && isTokenExpiredOrExpiringSoon(token)) {
      try {
        token = await getRefreshedToken();
      } catch (err) {
        handleRefreshFailure();
        throw err;
      }
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type AuthRequestConfig = AxiosRequestConfig & { _retry?: boolean };

axiosAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AuthRequestConfig;

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (!REFRESH_ENDPOINT) {
      handleRefreshFailure();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await getRefreshedToken();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosAuth(originalRequest);
    } catch (err) {
      handleRefreshFailure();
      return Promise.reject(err);
    }
  }
);

export default axiosAuth;
