import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("PROFILE.storybookUrl", () => {
  it("links the live Storybook from builds and tests", async () => {
    const { PROFILE } = await import("./profile.ts");
    expect(PROFILE.storybookUrl).toBe("https://karolina.kita.company/storybook/");
  });

  it("links the local Storybook (yarn storybook, port 6006) on the dev server", async () => {
    vi.stubEnv("MODE", "development");
    vi.resetModules();
    const { PROFILE } = await import("./profile.ts");
    expect(PROFILE.storybookUrl).toBe("http://localhost:6006/");
  });
});
