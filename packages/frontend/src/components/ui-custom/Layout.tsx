import { ReactNode } from "react";
import { Footer } from "./Footer";
import { FeedbackWidget } from "@/components/support/FeedbackWidget";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FeedbackWidget />
    </div>
  );
}
