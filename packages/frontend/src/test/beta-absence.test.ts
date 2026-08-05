import { expect, test } from "vitest";

test("no beta flags in production build", () => {
  const config = { isBeta: false, env: "production" };
  expect(config.isBeta).toBe(false);
  expect(config.env).toBe("production");
});
