import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import pool from "../../configs/dbConfig.js";
import {
  createBoard,
  getBoardBySlug,
  deleteBoard,
} from "../../repositories/boardRepository.js";

test("createBoard создает доску в БД", async () => {
  const slug = `test-${randomUUID()}`;

  try {
    const board = await createBoard({
      slug,
      name: "Test Board",
    });

    assert.ok(board.id);
    assert.equal(board.slug, slug);
    assert.equal(board.name, "Test Board");

    const savedBoard = await getBoardBySlug(slug);

    assert.ok(savedBoard);
    assert.equal(savedBoard.id, board.id);
  } finally {
    await deleteBoard(slug);
  }
});

after(async () => {
  await pool.end();
});