/**
 * Node.js type declarations — Build 110 / v1.1.0
 */

declare module "node:stream" {
  export interface Readable {
    [Symbol.asyncIterator](): AsyncIterator<Buffer>;
  }
}

declare module "node:crypto" {
  export function createHmac(algorithm: string, key: string): any;
}
