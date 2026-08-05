import { Outlet, Navigate } from "react-router-dom";
import { trpc } from "@/providers/trpc";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AuthLayout() {
  const user = trpc.auth.me.useQuery();

  if (user.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user.data) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
