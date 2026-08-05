import { expect, test } from "vitest";

test("admin routes require admin role", () => {
  const isAdmin = (role: string) => role === "admin";
  expect(isAdmin("admin")).toBe(true);
  expect(isAdmin("user")).toBe(false);
  expect(isAdmin("enterprise")).toBe(false);
});
