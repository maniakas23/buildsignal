import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════
// BuildSignal Frontend tRPC Client
// Connects to the separated API Worker at api.buildsignal.com
// In development: proxied via Vite dev server to localhost:8787
// In production: calls https://api.buildsignal.com/api/trpc
// ═══════════════════════════════════════════════════════════════

// Use a slim type interface since AppRouter is in the API package now.
// The actual router type is validated at build time via the API package.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppRouter = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc: any = createTRPCReact<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Determine the API base URL
// In production: VITE_API_URL is set (e.g., https://api.buildsignal.com)
// In development: empty string (proxied by Vite dev server)
const apiBaseUrl = import.meta.env.VITE_API_URL || "";
const trpcUrl = apiBaseUrl ? `${apiBaseUrl}/api/trpc` : "/api/trpc";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: trpcUrl,
      transformer: superjson,
      fetch(input: any, init: any) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
