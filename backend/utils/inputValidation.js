const INTEGER_MAX = 2_147_483_647n;
const BIGINT_MAX = 9_223_372_036_854_775_807n;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
]);

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const codePointLength = (value) => [...value].length;
const isNonBlankString = (value) => typeof value === "string" && value.trim().length > 0;
const isPositiveInteger = (value, max) =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0 && BigInt(value) <= max;

function parsePositiveId(value, max = BIGINT_MAX) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  try {
    const parsed = BigInt(value);
    return parsed <= max ? parsed : null;
  } catch {
    return null;
  }
}

function validateBoardInput(input) {
  if (!isRecord(input)) return ["body must be an object"];
  const errors = [];
  if (typeof input.slug !== "string" || codePointLength(input.slug) < 1 || codePointLength(input.slug) > 16) {
    errors.push("slug must be a string of 1 to 16 characters");
  }
  if (!isNonBlankString(input.name) || codePointLength(input.name) > 100) {
    errors.push("name must be a non-empty string of at most 100 characters");
  }
  for (const [field, fallback] of [["bumpLimit", 500], ["maxThreads", 100]]) {
    if (input[field] !== undefined && !isPositiveInteger(input[field], INTEGER_MAX)) {
      errors.push(`${field} must be a positive 32-bit integer`);
    } else if (input[field] === undefined && fallback <= 0) {
      errors.push(`${field} has an invalid default`);
    }
  }
  return errors;
}

function validateThreadInput(input, files = []) {
  if (!isRecord(input)) return ["body must be an object"];
  const errors = [];
  if (typeof input.subject === "string" && codePointLength(input.subject) > 200) {
    errors.push("subject must be at most 200 characters");
  } else if (input.subject !== undefined && input.subject !== null && typeof input.subject !== "string") {
    errors.push("subject must be a string");
  }
  if (!isNonBlankString(input.message)) errors.push("message must be a non-empty string");
  if (input.board_id !== undefined && parsePositiveId(input.board_id, INTEGER_MAX) === null) {
    errors.push("board_id must be a positive 32-bit integer string");
  }
  if (!Array.isArray(files) || files.length > 4) errors.push("at most 4 files are allowed");
  return errors;
}

function validatePostInput(input, files = []) {
  if (!isRecord(input)) return ["body must be an object"];
  const errors = [];
  if (!isNonBlankString(input.message)) errors.push("message must be a non-empty string");
  if (input.boardId !== undefined && parsePositiveId(input.boardId, INTEGER_MAX) === null) {
    errors.push("boardId must be a positive 32-bit integer string");
  }
  if (!Array.isArray(files) || files.length > 1) errors.push("at most 1 file is allowed");
  return errors;
}

function validateImageFile(file) {
  if (!isRecord(file)) return ["file is required"];
  const errors = [];
  if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) errors.push("unsupported image type");
  if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0 || file.size !== file.buffer.length) {
    errors.push("file size must be positive and match its buffer");
  }
  if (typeof file.originalname !== "string" || file.originalname.length === 0 ||
      file.originalname.length > 255 || /[\x00-\x1f\x7f]/.test(file.originalname)) {
    errors.push("original name must contain 1 to 255 safe characters");
  }
  return errors;
}

function validateReportTarget(input) {
  if (!isRecord(input)) return false;
  return (input.threadId !== undefined && input.threadId !== null) !==
    (input.postId !== undefined && input.postId !== null);
}

export {
  parsePositiveId,
  validateBoardInput,
  validateThreadInput,
  validatePostInput,
  validateImageFile,
  validateReportTarget,
};
