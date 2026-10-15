import { describe, it, expect, vi } from "vitest";

vi.mock("../../configs/dbConfig.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

import pool from "../../configs/dbConfig.js";
import { getThreadById } from "../../models/threads.js";

describe("getThreadById", () => {
  it("should return thread by id", async () => {
    const mockThread = { id: 1, subject: "Test thread" };

    pool.query.mockResolvedValue({ rows: [mockThread] });

    const result = await getThreadById(1);

    expect(result).toEqual(mockThread);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE id = $1"),
      [1],
    );
  });
});