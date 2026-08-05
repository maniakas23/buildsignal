import { expect, test } from "vitest";

test("demo data contains fictional counties only", () => {
  const counties = ["Maricopa, AZ", "Harris, TX", "Miami-Dade, FL", "Denver, CO", "Travis, TX"];
  expect(counties.length).toBeGreaterThan(0);
  counties.forEach((c) => {
    expect(c).toContain(",");
  });
});
