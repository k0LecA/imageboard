import { test, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";

import pool from "../../configs/dbConfig.js";
import {
  createBoard,
  getBoards,
  getBoardBySlug,
  deleteBoard,
} from "../../models/boards.js";

test("createBoard creates a board in the database", async () => {
  expect(process.env.POSTGRES_DB).toBe("app_test");
  expect(process.env.DB_HOST).toBe("127.0.0.1");
  expect(process.env.DB_PORT).toBe("5433");

  const slug = `test-${randomUUID().replaceAll("-", "").slice(0, 11)}`;

  // Проверяем подключение к тестовой базе
  const { rows: databaseRows } = await pool.query(
    "SELECT current_database() AS database",
  );

  expect(databaseRows[0].database).toBe("app_test");

  let created = false;

  try {
    const board = await createBoard({
      slug,
      name: "Test Board",
    });

    created = true;

    expect(board.id).toBeDefined();
    expect(board.slug).toBe(slug);
    expect(board.name).toBe("Test Board");

    const savedBoard = await getBoardBySlug(slug);

    expect(savedBoard).toBeDefined();
    expect(savedBoard.id).toBe(board.id);

    const boards = await getBoards();

    expect(boards.some(({ id }) => id === board.id)).toBe(true);
  } finally {
    if (created) {
      await deleteBoard(slug);
    }
  }
});

afterAll(async () => {
  await pool.end();
});