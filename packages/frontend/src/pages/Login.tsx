import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight, Globe, Eye, EyeOff, Mail, Lock, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"sso" | "password">("password");

  const handleLogin = () => {
    window.location.href = "https://api.buildsignal.net/auth/login";
  };

  const handleSso = () => {
    // In production, this would call the SSO discovery API
    if (domain.includes("@")) {
      window.location.href = `https://api.buildsignal.net/auth/sso?email=${encodeURIComponent(domain)}`;
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Branding */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your BuildSignal account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 flex items-center gap-2">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert("Password reset functionality coming soon.")}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-input bg-background pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* SSO / Kimi Login */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Globe className="h-4 w-4" />
            Continue with Kimi
          </button>

          <button
            onClick={() => setMode(mode === "sso" ? "password" : "sso")}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Building2 className="h-4 w-4" />
            {mode === "sso" ? "Hide Enterprise SSO" : "Enterprise SSO"}
            <ArrowRight
              className={cn(
                "h-4 w-4 transition-transform",
                mode === "sso" && "rotate-90"
              )}
            />
          </button>

          {mode === "sso" && (
            <div className="space-y-2 pt-2">
              <input
                type="text"
                placeholder="yourname@company.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleSso}
                disabled={!domain.includes("@")}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Continue with SSO
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sign up link */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Don't have an account?</span>
            <button
              onClick={() => navigate("/signup")}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            SSL Secure
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            SOC 2 Type II
          </span>
        </div>
      </div>
    </div>
  );
}
