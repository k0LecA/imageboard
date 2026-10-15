import { it, expect, vi } from "vitest";

vi.mock("../../models/threads.js", () => ({
  getThreadById: vi.fn(),
}));

import { getThreadById } from "../../models/threads.js";
import { getThread } from "../../controllers/threads.js";

it("should return thread with status 200", async () => {
  const thread = { id: 1, subject: "Test thread" };

  getThreadById.mockResolvedValue(thread);

  const req = { params: { threadId: 1 } };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const next = vi.fn();

  await getThread(req, res, next);

  expect(getThreadById).toHaveBeenCalledWith(1);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ data: thread });
  expect(next).not.toHaveBeenCalled();
});