import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { APIResponse } from "../types";

export const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes("localhost:8000")) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("focusflow_api_url");
    if (saved) return saved;

    const hostname = window.location.hostname;
    if (hostname.includes("onrender.com")) {
      const match = hostname.match(/^focusflow-web(-[a-z0-9]+)?\.onrender\.com$/);
      if (match && match[1]) {
        return `https://focusflow-api${match[1]}.onrender.com/api`;
      }
      return "https://focusflow-api.onrender.com/api";
    }
  }

  return envUrl || "http://localhost:8000/api";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor injecting dynamic Bearer token and baseURL
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getBaseUrl();
    const token = localStorage.getItem("focusflow_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with automatic token rotation
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/login")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("focusflow_refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("focusflow_access_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post<APIResponse<{ access_token: string; refresh_token: string }>>(
          `${getBaseUrl()}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const newAccessToken = refreshResponse.data.data.access_token;
        const newRefreshToken = refreshResponse.data.data.refresh_token;

        localStorage.setItem("focusflow_access_token", newAccessToken);
        localStorage.setItem("focusflow_refresh_token", newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("focusflow_access_token");
        localStorage.removeItem("focusflow_refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
