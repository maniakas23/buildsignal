// Minimal Node.js type declarations for Cloudflare Workers environment
// These are runtime polyfills, not actual Node.js APIs

declare namespace NodeJS {
  interface Process {
    env: Record<string, string | undefined>;
    exit(code?: number): never;
  }
}

declare var process: NodeJS.Process;

declare module "os" { export function homedir(): string; export function tmpdir(): string; }
declare module "path" { export function join(...paths: string[]): string; export function resolve(...paths: string[]): string; }
declare module "fs" { export function existsSync(path: string): boolean; export function readFileSync(path: string, encoding?: string): string; }
declare module "fs/promises" { export function readFile(path: string, encoding?: string): Promise<string>; }
declare module "http" {
  interface IncomingMessage { headers: Record<string, string | string[]>; }
  interface ServerResponse { end(data?: string): void; }
}

declare var Buffer: {
  from(data: string, encoding?: string): Uint8Array;
  isBuffer(obj: unknown): boolean;
};

interface ImportMeta {
  dirname?: string;
}
