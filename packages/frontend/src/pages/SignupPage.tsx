import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Button variant="ghost" onClick={() => navigate("/login")} className="mb-4 gap-2"><ArrowLeft className="h-4 w-4"/>Back to Login</Button>
      <Card>
        <CardHeader><CardTitle>Create Account</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" /></div>
            <Button type="submit" className="w-full gap-2">Continue with Kimi <ArrowRight className="h-4 w-4"/></Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
