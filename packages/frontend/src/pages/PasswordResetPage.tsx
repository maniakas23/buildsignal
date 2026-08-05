import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PasswordResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Button variant="ghost" onClick={() => navigate("/login")} className="mb-4 gap-2"><ArrowLeft className="h-4 w-4"/>Back to Login</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/>Reset Password</CardTitle></CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm">If an account exists with <strong>{email}</strong>, you will receive password reset instructions.</p>
              <Button onClick={() => navigate("/login")}>Back to Login</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" /></div>
              <Button type="submit" className="w-full">Send Reset Link</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
