import { useState, useEffect } from "react";

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string } | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for auth token/session
    const checkAuth = async () => {
      try {
        // In production, validate token with API
        const token = localStorage.getItem("auth_token");
        if (token) {
          setState({
            isAuthenticated: true,
            user: { id: "1", email: "user@example.com", name: "Demo User" },
            isLoading: false,
          });
        } else {
          setState({ isAuthenticated: false, user: null, isLoading: false });
        }
      } catch {
        setState({ isAuthenticated: false, user: null, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // In production, call API for login
    console.log("Login:", email, password);
    localStorage.setItem("auth_token", "demo_token");
    setState({ isAuthenticated: true, user: { id: "1", email, name: "Demo User" }, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setState({ isAuthenticated: false, user: null, isLoading: false });
  };

  return { ...state, login, logout };
}
