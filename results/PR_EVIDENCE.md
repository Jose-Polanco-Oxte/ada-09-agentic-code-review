# PR Evidence

## Change
- **Change ID:** CR-02
- **PR / Branch:** `ada09/cr-02`
- **Base commit:** `b865ee3a441e482d08a3ddc44604ba5c8df8432d` (`docs(spec): define FR-05 and AC-05 for priority-based note filtering`)
- **Final commit:** `96ffdddedea7fa2d38fa9e2a7f5397ebec707675` (`fix: address ADA-09 review findings`)

## Requirements / Acceptance Criteria
- **FR-05 (FR-05.1, FR-05.2, FR-05.3, FR-05.4, FR-05.5):** Priority-Based Note Filtering in `NoteRepository`.
- **AC-05.1:** Query by valid priority ('baja', 'media', 'alta') returns matching notes in chronological descending order (`createdAt` descending).
- **AC-05.2:** Empty match handling returns `StorageResult.ok([])` with `length === 0`.
- **AC-05.3:** Parameter validation rejects invalid, null, undefined, empty, non-string, or unknown priority strings with descriptive error in `result.error`.
- **AC-05.4:** Invariant & immutability preservation guarantees all returned entities are frozen (`Object.isFrozen`) and modifying returned array does not mutate internal storage state.
- **FR-01.5:** Strict adherence to canonical priority levels (`baja`, `media`, `alta`).
- **NFR-01:** Creation-Only Invariant: strictly no deletion methods exposed or added.
- **NFR-02:** Zero external runtime dependencies.
- **NFR-03:** In-memory fallback resilience preserved.

## Implementation
- **Coder report:** [`results/coder-report.md`](file:///c:/Users/tony/Desktop/Septimo%20semestre/is-a-ia/ada-09-agentic-code-review/results/coder-report.md)
- **Files changed:**
  - `CHANGE_REQUEST.md`: Formal change definition and Human Gate 0 authorization.
  - `js/storage.js`: Added `filterByPriority(priority)` method to `NoteRepository`, imported `VALID_PRIORITIES` from `models.js`.
  - `tests/notes.test.mjs`: Added full automated test suite covering AC-05.1, AC-05.2, AC-05.3, AC-05.4.
  - `results/*`: Audit artifacts (run context, diff, commits, reports, review decisions).
- **Commits:**
  - `b817422 feat: implement CR-02 priority filtering` (Candidate implementation)
  - `96ffddd fix: address ADA-09 review findings` (Fix cycle addressing RF-01 and elevated RF-02)

## Verification
- **Verification command:** `powershell -ExecutionPolicy Bypass -File .\scripts\verify_repo.ps1` (and `node --test tests/notes.test.mjs`, `node --check js/models.js js/storage.js js/app.js`, `python scripts/check_repo_contract.py`)
- **Final result:** PASS (All stages green, 0 exit code)
- **Tests:** 18 passing tests across 5 test suites (100% pass rate).
- **Lint:** PASS (`node --check` syntax verification succeeded).
- **Security / repo checks:** PASS (`check_repo_contract.py` confirmed 0 sensitive files, 0 deletion methods, and all contracts intact).

## Independent Review
- **Review report:** [`results/review-report.md`](file:///c:/Users/tony/Desktop/Septimo%20semestre/is-a-ia/ada-09-agentic-code-review/results/review-report.md)
- **MUST FIX found:** 1 (`RF-01`: Hardcoded priorities array in `js/storage.js` bypassing domain layer import).
- **SHOULD FIX found:** 1 (`RF-02`: Missing automated test suite for `AC-05.4` immutability and array mutation resistance).
- **OPTIONAL found:** 1 (`RF-03`: JSDoc parameter type refinement to literal union `'baja'|'media'|'alta'`).

## Human Decisions
- **Accepted:** 1 (`RF-01`: Validated domain boundary violation; mandated importing `VALID_PRIORITIES` from `models.js`).
- **Modified:** 1 (`RF-02`: Elevated from SHOULD FIX to MUST FIX due to non-negotiable nature of entity immutability and array isolation invariants).
- **Rejected:** 0
- **Deferred:** 1 (`RF-03`: Retained `@param {string} priority` to prevent documentation divergence with `filterByCategory`; logged as non-blocking technical debt).

## Re-review
- **Re-review report:** [`results/re-review-report.md`](file:///c:/Users/tony/Desktop/Septimo%20semestre/is-a-ia/ada-09-agentic-code-review/results/re-review-report.md)
- **Resolved:** 2 (`RF-01` resolved by importing `VALID_PRIORITIES` in `js/storage.js:17,172`; `RF-02` resolved by adding test suite for `AC-05.4` in `tests/notes.test.mjs:394-430`).
- **Partially resolved:** 0
- **Not resolved:** 0
- **New MUST FIX:** 0 (Zero regressions introduced).

## Traceability

| Requirement / AC | Task / Change | Code | Test | Review Finding |
|---|---|---|---|---|
| **FR-05.1 / AC-05.1** | Add `filterByPriority` to `NoteRepository` | `js/storage.js:167-190` | `tests/notes.test.mjs:322-358` | Verified in initial pass; confirmed chronological descending sort order. |
| **FR-05.3 / AC-05.2** | Empty match handling returning `StorageResult.ok([])` | `js/storage.js:184-188` | `tests/notes.test.mjs:360-367` | Verified empty array returned on valid priority without matching records. |
| **FR-05.4 / AC-05.3** | Strict parameter validation against domain schema | `js/storage.js:168-176` | `tests/notes.test.mjs:369-392` | **RF-01 (MUST FIX):** Storage layer hardcoded priorities fixed to import `VALID_PRIORITIES` from `models.js`. |
| **FR-05.5 / AC-05.4** | Defensive immutability and storage state isolation | `js/storage.js:187` | `tests/notes.test.mjs:394-430` | **RF-02 (MUST FIX):** Initial suite omitted test; added explicit test for `Object.isFrozen` and array manipulation resilience. |
| **NFR-01** | Prohibition of deletion/removal operations | `js/storage.js` | `tests/notes.test.mjs:107-122` | Verified no deletion methods exist in prototype or source. |
| **NFR-02** | Zero external runtime dependencies | `package.json` | `scripts/check_repo_contract.py` | Verified pure vanilla ES2022 implementation. |

## Remaining Risks / Technical Debt
- **Tracked Technical Debt (RF-03):** JSDoc parameter annotations across `NoteRepository` (`filterByCategory`, `filterByPriority`) use generic `@param {string}` rather than TypeScript/JSDoc literal union types (`'baja' | 'media' | 'alta'`). Deferred to future project-wide type definitions ticket.
- **UI Exposure:** `index.html` and `js/app.js` do not yet feature a dropdown for priority filtering. The storage repository layer is ready and fully tested to support UI integration in a subsequent change request.

## Final Human Decision
- [ ] NOT READY
- [x] READY FOR HUMAN MERGE

**Approved by:** Antonio Polanco (Lead Software Engineer & Human Reviewer)  
**Date:** 2026-11-04
