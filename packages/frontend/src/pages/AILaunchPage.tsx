import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/providers/trpc";

export function AILaunchPage() {
  const navigate = useNavigate();
  const { data: status } = trpc.monitoring.kestovar.useQuery();

  useEffect(() => {
    if (status?.status === "online") {
      navigate("/dashboard");
    }
  }, [status, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground">Initializing AI engine...</p>
      </div>
    </div>
  );
}
