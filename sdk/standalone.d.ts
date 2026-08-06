declare module "standalone" {
  export interface StandaloneConfig {
    apiUrl: string;
    apiKey?: string;
  }

  export class StandaloneClient {
    constructor(config: StandaloneConfig);
    getStatus(): Promise<{ status: string }>;
  }

  export default StandaloneClient;
}
