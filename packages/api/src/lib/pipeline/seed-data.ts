import { counties } from "../../db/schema";

export async function seedCounties(db: any) {
  const seedData = [
    { name: "Harris County", state: "TX", fips: "48029", population: 4731045, growthRate: 1.2, permitCount: 15000, permitValue: 5000000000, signalScore: 8.5, lat: 29.7601, lng: -95.3631 },
    { name: "Dallas County", state: "TX", fips: "48113", population: 2642524, growthRate: 1.5, permitCount: 12000, permitValue: 4000000000, signalScore: 8.2, lat: 32.7767, lng: -96.7970 },
    { name: "Travis County", state: "TX", fips: "48453", population: 1290188, growthRate: 2.1, permitCount: 8000, permitValue: 2500000000, signalScore: 8.7, lat: 30.2672, lng: -97.7431 },
    { name: "King County", state: "WA", fips: "53033", population: 2269672, growthRate: 1.8, permitCount: 9500, permitValue: 3500000000, signalScore: 8.4, lat: 47.6062, lng: -122.3321 },
    { name: "Maricopa County", state: "AZ", fips: "04013", population: 4410824, growthRate: 2.3, permitCount: 18000, permitValue: 6000000000, signalScore: 8.9, lat: 33.4484, lng: -112.0740 },
  ];

  for (const data of seedData) {
    const id = crypto.randomUUID();
    await db.insert(counties).values({ ...data, id, createdAt: new Date(), updatedAt: new Date() }).onConflictDoNothing();
  }
}
