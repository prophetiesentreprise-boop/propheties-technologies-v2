import { describe, expect, it } from "vitest";
import { hasAdminAccess } from "./useAuth";

describe("hasAdminAccess", () => {
  it("accorde les droits de gestion au rôle owner", () => {
    expect(hasAdminAccess("owner")).toBe(true);
  });

  it("accorde les droits de gestion au rôle admin et refuse les autres rôles", () => {
    expect(hasAdminAccess("admin")).toBe(true);
    expect(hasAdminAccess("user")).toBe(false);
    expect(hasAdminAccess(null)).toBe(false);
  });
});
