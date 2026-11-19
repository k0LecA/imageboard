# Function Complexity Analysis

## Scope and measurements

This report covers assignment section 3 for the imageboard project. The SonarQube values below were supplied by the project author; SonarQube was not rerun for this report. Explanations and the manual calculation are based on the current source code. No implementation changes are included.

| Function | Source file | Cyclomatic Complexity | Cognitive Complexity | Basis-path test estimate |
| --- | --- | ---: | ---: | ---: |
| `validateSession` | [authService.js](../backend/services/authService.js) | 8 | 6 | 8 |
| `createPost` | [posts.js](../backend/controllers/posts.js) | 3 | 7 | 3 |
| `errorHandler` | [errorMiddleware.js](../backend/middleware/errorMiddleware.js) | 8 | 6 | 8 |
| `validateBoardInput` | [inputValidation.js](../backend/utils/inputValidation.js) | 12 | 9 | 12 |
| `validateBoard` | [validateBoard.js](../backend/middleware/validateBoard.js) | 22 | 10 | 22 |

The descriptions of low, moderate, and high complexity below are relative to these five functions, rather than claims about a configured SonarQube quality threshold.

## What the two metrics mean

**Cyclomatic Complexity** estimates the number of linearly independent execution paths. A function starts at 1, and counted decision points increase its score. Compound Boolean expressions can add paths through short-circuit evaluation even when they appear inside a single `if`.

**Cognitive Complexity** estimates the difficulty of following control flow. Branches, nesting, and changes in logical structure contribute to the reading effort. A sequence of simple checks with early returns is generally easier to follow than deeply nested recovery logic.

The scores measure different things and are not interchangeable. For example, `validateBoard` has many input-dependent paths (22) but limited nesting, giving it Cognitive Complexity 10. Conversely, `createPost` has the lowest Cyclomatic Complexity (3), but its nested error recovery gives it Cognitive Complexity 7, above `validateSession` and `errorHandler`.

## Explanation of each function

### 1. `validateSession`: Cyclomatic 8, Cognitive 6

The function checks the parsed token, the existence of a session, its expiration date, the stored hash type, and the result of bcrypt comparison. There are five `if` statements, an `||` in the expiration check, and a ternary expression that converts a Buffer hash to a string. These decisions explain the moderate Cyclomatic score.

There are no loops or nested `if` blocks. Invalid states immediately return `null`, leaving the successful path easy to follow. This flat structure explains why Cognitive Complexity is lower than Cyclomatic Complexity. The internals of `parseSessionToken` are a separate function and are not counted here.

### 2. `createPost`: Cyclomatic 3, Cognitive 7

There are two explicit `if` statements: one for an optional file upload and one for cleanup after a failure. Together with the initial path, they explain the low reported Cyclomatic score of 3. The supplied result does not add separate increments for the `catch` blocks.

Understanding the function requires following both normal execution and recovery: upload a file, create a post, delete the uploaded file if creation fails, and handle a deletion failure inside another `try/catch`. This nesting explains the higher Cognitive score of 7. There are no loops. The function also coordinates several responsibilities, increasing the practical reading effort.

### 3. `errorHandler`: Cyclomatic 8, Cognitive 6

The function chooses an initial status with a ternary expression, checks whether the error comes from Multer, maps upload error codes through a `switch`, checks whether to log a server error, and chooses the public message with another ternary expression. These alternatives produce a moderate Cyclomatic score of 8.

Most decisions are short and sequential. The main nesting is the `switch` inside the Multer check; there are no loops or recursive calls. Its focused responsibility and limited nesting keep Cognitive Complexity at 6.

### 4. `validateBoardInput`: Cyclomatic 12, Cognitive 9

The function checks the body shape, slug, and name, then loops over two optional numeric fields. Several conditions contain `||` or `&&`, adding short-circuit paths. Inside the loop, an `if/else if` distinguishes invalid explicit values from invalid fallback values. The combination of Boolean conditions, iteration, and branching produces the relatively high Cyclomatic score of 12.

The loop contains nested decisions, so the reader must track both the current field and its validation outcome. This raises Cognitive Complexity to 9. Helper predicates keep some details outside the function, but the fallback branch adds unnecessary reasoning: the hard-coded defaults are 500 and 100, so `fallback <= 0` cannot be true in the current code.

### 5. `validateBoard`: Cyclomatic 22, Cognitive 10

This function has the highest scores in the sample. Eight `if` statements validate six fields, and their expressions contain many `||` and `&&` operators. For example, slug and theme each combine presence, type, minimum-length, and maximum-length checks. Short-circuit alternatives explain why Cyclomatic Complexity reaches 22 even without loops.

The checks are flat and return immediately on invalid input. This limits nesting and makes the function easier to follow than its path count alone suggests. Nevertheless, repeated conditions and the number of validation rules give it the highest Cognitive score, 10.

## Manual Cyclomatic Complexity calculation

For `validateSession`, count the initial path and each decision represented in the reported JavaScript metric:

| Element | Increment |
| --- | ---: |
| Initial function path | 1 |
| `if (!parsed)` | 1 |
| `if (!session)` | 1 |
| `if` checking expiration | 1 |
| `||` joining invalid-date and expired-date checks | 1 |
| Ternary selecting Buffer conversion or the original hash | 1 |
| `if (typeof tokenHash !== 'string')` | 1 |
| `if (!isMatch)` | 1 |
| **Total** | **8** |

Thus, **Cyclomatic Complexity = 1 + 5 + 1 + 1 = 8**. The manual result matches the supplied SonarQube value of **8**. Calls to other functions, `await`, and plain `return` statements do not add decisions in this calculation.

## Minimum test estimates and their limits

For basis-path planning, use each function's Cyclomatic Complexity as the theoretical minimum number of independent-path scenarios: **8, 3, 8, 12, and 22**, respectively. These are planning estimates, not verified executable test-suite sizes. They do not guarantee complete condition, boundary, input-combination, or exception coverage. Unreachable paths can prevent a literal basis-path target from being achieved.

| Function | Estimate | Scenarios to consider when designing tests |
| --- | ---: | --- |
| `validateSession` | 8 | Malformed token; missing session; invalid expiration date; expired session; unsupported hash type; secret mismatch; successful validation with a Buffer hash; successful validation with a string hash. |
| `createPost` | 3 | Success without a file; success with a file; post creation failure after upload with successful cleanup. Add upload failures, creation failure without a file, and cleanup failures beyond this estimate. |
| `errorHandler` | 8 | Integer and absent/non-integer status codes; Multer size, count, unexpected-field, and unknown-code cases; client versus server errors; public-message selection and logging behavior. |
| `validateBoardInput` | 12 | Invalid body; slug type and length boundaries; blank and oversized name; omitted, valid, and invalid numeric fields; accumulation of multiple errors. The invalid-default branch is unreachable with the current constants. |
| `validateBoard` | 22 | Presence, type, and length failures for required fields; each name-length rejection; omitted, valid, fractional, and negative numeric limits; valid input reaching `next()`. Vary conditions individually where short-circuit evaluation permits it. |

The scenario lists guide test selection; they are not a demonstrated independent-path basis. In particular, `createPost` shows why a low Cyclomatic score is insufficient for comprehensive testing: asynchronous failures and cleanup behavior require additional scenarios. For `validateBoardInput`, document the unreachable fallback branch instead of claiming that a test can execute it.

## Conclusions and simplification priorities

1. **Simplify `validateBoard` first.** It has the largest path count and the highest Cognitive score. Named field validators could make the compound checks easier to read and test. Before consolidating it with `validateBoardInput`, agree on their differing field names and validation rules so that a refactor does not silently change behavior.
2. **Simplify `validateBoardInput` next.** Remove the unreachable invalid-default check, or validate configurable defaults separately if defaults become configurable. A small helper for optional positive integer fields could reduce nesting while retaining error accumulation.
3. **Consider extracting upload and cleanup coordination from `createPost`.** Its nested recovery logic is harder to follow than its Cyclomatic score suggests. A focused service could clarify the controller while preserving cleanup and error propagation. Extraction moves complexity and does not automatically eliminate it.
4. **Keep `validateSession` largely as it is.** Its flat guard clauses make the security checks readable. Any extraction should improve clarity without removing validation or changing bcrypt-based verification.
5. **Keep `errorHandler` largely as it is.** The function has one clear purpose and manageable nesting. A lookup table for upload error statuses may help if the mapping grows, but the current scores alone do not justify a major rewrite.

The main improvement opportunities are repeated validation logic and nested failure recovery. Both metrics are useful together: Cyclomatic Complexity guides path-oriented testing, while Cognitive Complexity helps identify code that requires more effort to understand and maintain.
