# Review Contract

## Change
CR-02

## Requirements / Acceptance Criteria
- **FR-05.1:** `NoteRepository` must expose `filterByPriority(priority)` returning matching notes.
- **FR-05.2 / AC-05.1:** Returned notes must be sorted in chronological descending order (`createdAt` descending).
- **FR-05.3 / AC-05.2:** Valid priority with zero matching notes returns `StorageResult.ok([])` with `length === 0`.
- **FR-05.4 / AC-05.3:** Calling with `null`, `undefined`, non-string, empty string, or value outside `VALID_PRIORITIES` returns `StorageResult.fail(...)`.
- **FR-05.5 / AC-05.4:** Modifying the returned array must not mutate internal storage state; all returned note entities must be frozen (`Object.isFrozen(note) === true`).
- **FR-01.5:** Valid priorities are strictly defined as `['baja', 'media', 'alta']`.
- **NFR-01:** Strictly NO deletion, modification, or removal methods introduced.
- **NFR-02:** Zero external runtime dependencies.

## Architecture Constraints
- **Expected dependency flow:** `Presentation (HTML/CSS) -> Application (app.js) -> Domain (models.js) -> Persistence (storage.js)`. Storage layer may only import from Domain (`models.js`).
- **Business-rule location:** Priority validation schema and allowable constants (`VALID_PRIORITIES`) reside strictly in Domain (`models.js`). Storage layer must consume domain constants rather than defining private copies.
- **Protected boundaries:** `NoteRepository` must preserve `StorageResult` wrapper pattern (`StorageResult.ok(data)` / `StorageResult.fail(error)`). Immutability of stored entities must be preserved in both standard and in-memory fallback modes.

## Review Rules
- Verify requirement coverage (all acceptance criteria AC-05.1 through AC-05.4 covered by implementation and tests).
- Verify every called API/dependency exists in production code without hallucination.
- Check architecture boundaries (no business rule leaks into storage, no domain duplication).
- Inspect tests for masking / false confidence (check whether tests actually test edge cases, mutation isolation, and immutability).
- Check regression behavior (verify existing tests and NFR-01 invariants are fully intact).
- Identify unnecessary technical debt (duplicate arrays, unverified assumptions).
- Cite concrete evidence (file name, line number, code snippet) for every finding.

## Severity
- **MUST FIX:** Requirement violation, regression, security/integrity risk, hallucinated API/dependency, broken architecture constraint, missing core acceptance criteria test, or defect that makes the change unsafe to approve.
- **SHOULD FIX:** Significant maintainability, coverage, design, or clarity issue that does not block the requested behavior.
- **OPTIONAL:** Non-blocking improvement outside the minimum acceptance threshold (stylistic, cosmetic, or documentation polish).
