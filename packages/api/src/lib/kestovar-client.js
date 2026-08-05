export class KestovarClient {
  constructor(private baseUrl: string, private apiKey: string) {}

  async health() {
    const res = await fetch(`${this.baseUrl}/health`, { headers: { "X-API-Key": this.apiKey } });
    return res.json();
  }

  async ready() {
    const res = await fetch(`${this.baseUrl}/ready`, { headers: { "X-API-Key": this.apiKey } });
    return res.json();
  }

  async capabilities() {
    const res = await fetch(`${this.baseUrl}/capabilities`, { headers: { "X-API-Key": this.apiKey } });
    return res.json();
  }

  async dashboard() {
    const res = await fetch(`${this.baseUrl}/dashboard`, { headers: { "X-API-Key": this.apiKey } });
    return res.json();
  }

  async providers() {
    const res = await fetch(`${this.baseUrl}/providers`, { headers: { "X-API-Key": this.apiKey } });
    return res.json();
  }

  async alerts() {
    const res = await fetch(`${this.baseUrl}/alerts`, { headers: { "X-API-Key": this.apiKey } });
    return res.json();
  }

  async recommendations() {
    const res = await fetch(`${this.baseUrl}/recommendations/quality`, { headers: { "X-API-Key": this.apiKey } });
    return res.json();
  }

  async events(body: any) {
    const res = await fetch(`${this.baseUrl}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": this.apiKey },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async batchEvents(body: any) {
    const res = await fetch(`${this.baseUrl}/events/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": this.apiKey },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async generateRecommendation(body: any) {
    const res = await fetch(`${this.baseUrl}/recommendations/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": this.apiKey },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async analyzePatterns(body: any) {
    const res = await fetch(`${this.baseUrl}/patterns/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": this.apiKey },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async analyzeCorrelations(body: any) {
    const res = await fetch(`${this.baseUrl}/correlations/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": this.apiKey },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async knowledge(body: any) {
    const res = await fetch(`${this.baseUrl}/knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": this.apiKey },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async commands(body: any) {
    const res = await fetch(`${this.baseUrl}/commands`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": this.apiKey },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async feedback(body: any) {
    const res = await fetch(`${this.baseUrl}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": this.apiKey },
      body: JSON.stringify(body),
    });
    return res.json();
  }
}
