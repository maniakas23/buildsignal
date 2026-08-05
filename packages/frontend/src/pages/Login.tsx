import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight, Globe } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function Login() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState("");
  const [isSso, setIsSso] = useState(false);

  const discover = trpc.saml.discover.useQuery(
    { email: domain },
    { enabled: domain.includes("@") && isSso }
  );

  const handleLogin = () => {
    window.location.href = "https://api.buildsignal.net/auth/login";
  };

  const handleSso = () => {
    if (discover.data) {
      window.location.href = `https://api.buildsignal.net/auth/sso?provider=${discover.data.id}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight">BuildSignal</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Commercial Intelligence Platform
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Globe className="h-4 w-4" />
            Continue with Kimi
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or use Enterprise SSO
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="yourname@company.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
            />
            <button
              onClick={() => setIsSso(true)}
              disabled={!domain.includes("@")}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              <Building2 className="h-4 w-4" />
              Continue with SSO
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
