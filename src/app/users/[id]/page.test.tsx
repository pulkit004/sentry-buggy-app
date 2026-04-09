import { describe, it, expect, vi } from "vitest";
import { generateMetadata } from "./page";
import * as db from "@/lib/db";

vi.mock("@/lib/db");

describe("generateMetadata /users/[id]", () => {
  it("returns fallback metadata when user does not exist", async () => {
    vi.mocked(db.getUser).mockReturnValue(undefined as any);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "999" }),
    });

    expect(metadata.title).toBe("User Not Found");
    expect(metadata.description).toBe(
      "The requested user profile does not exist."
    );
  });

  it("returns user metadata when user exists", async () => {
    vi.mocked(db.getUser).mockReturnValue({
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      role: "admin",
    } as any);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "1" }),
    });

    expect(metadata.title).toBe("Profile: Alice");
    expect(metadata.description).toBe("View Alice's profile and activity");
  });
});
