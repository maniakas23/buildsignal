import { useState, useEffect } from "react";

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string } | null;
  isLoading: boolean;
}

/**
 * Auth hook for managing authentication state.
 *
 * TECHNICAL DEBT NOTE:
 * --------------------
 * The `demo_token` stored in localStorage is known technical debt.
 * It exists because the production auth API is not yet wired end-to-end.
 * This is an architectural placeholder — do NOT remove it without also
 * implementing a real token issuance / refresh flow from the backend.
 *
 * TODO: Replace `demo_token` with JWT access/refresh tokens from
 *       the production `/auth/login` and `/auth/refresh` endpoints.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for auth token/session on mount
    const checkAuth = async () => {
      try {
        // In production, validate token with API (e.g., GET /auth/me)
        const token = localStorage.getItem("auth_token");
        if (token) {
          // TODO: Replace demo_token validation with real API call
          setState({
            isAuthenticated: true,
            user: null, // Will be populated by a real /auth/me call
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

  /**
   * Log in with email and password.
   * In production, this should POST to /auth/login and receive a real JWT.
   */
  const login = async (email: string, _password: string) => {
    // TODO: Replace with real API call to /auth/login
    console.log("Login attempt:", { email });
    localStorage.setItem("auth_token", "demo_token");
    setState({
      isAuthenticated: true,
      user: {
        id: "1",
        email,
        name: email.split("@")[0] || "User",
      },
      isLoading: false,
    });
  };

  /**
   * Sign up a new user.
   * In production, this should POST to /auth/register and then call login.
   */
  const signup = async (
    email: string,
    password: string,
    company: string
  ) => {
    // TODO: Replace with real API call to /auth/register
    console.log("Signup attempt:", { email, company });
    await login(email, password);
  };

  /**
   * Log out the current user.
   * Clears all auth state from localStorage and React state.
   */
  const logout = () => {
    localStorage.removeItem("auth_token");
    setState({ isAuthenticated: false, user: null, isLoading: false });
  };

  return { ...state, login, signup, logout };
}
