import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { mobileApi, setAuthToken } from "../api/client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await mobileApi.post("/auth/login", { email, password: pass });
      const { access_token } = res.data.data;
      setAuthToken(access_token);

      const meRes = await mobileApi.get("/auth/me");
      setUser(meRes.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await mobileApi.post("/auth/register", {
        full_name: name,
        email,
        password: pass,
      });
      const { access_token } = res.data.data;
      setAuthToken(access_token);

      const meRes = await mobileApi.get("/auth/me");
      setUser(meRes.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
