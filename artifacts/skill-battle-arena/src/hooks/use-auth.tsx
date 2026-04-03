import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser, getGetCurrentUserQueryKey, setAuthTokenGetter, type User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Register the token getter with the API client so all requests include Authorization
setAuthTokenGetter(() => localStorage.getItem("auth_token"));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("auth_token"));

  const { data: user, isLoading, error } = useGetCurrentUser({
    query: {
      retry: false,
      enabled: !!token,
      queryKey: getGetCurrentUserQueryKey()
    }
  });

  const setToken = (newToken: string) => {
    localStorage.setItem("auth_token", newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setTokenState(null);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    queryClient.clear();
  };

  // Clear token if me endpoint fails with 401
  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: isLoading && !!token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
