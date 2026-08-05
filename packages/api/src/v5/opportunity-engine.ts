export class OpportunityEngine {
  async analyze(countyId: string) {
    return { opportunities: [] };
  }

  async score(countyId: string) {
    return { score: 0.5 };
  }
}
