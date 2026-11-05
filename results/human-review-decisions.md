# Human Review Decisions

## Change
CR-02

### RF-01 — Architecture & Business-Rule Placement
- **Reviewer severity:** MUST FIX
- **Human decision:** ACCEPTED
- **Reason:** The reviewer correctly proved that hardcoding `['baja', 'media', 'alta']` inside `NoteRepository.filterByPriority` violates the single source of truth and the architectural boundaries stipulated in `ARCHITECTURE.md` (Section 2: Domain Layer owns validation schemas; Persistence imports from Domain). `models.js` already exports `VALID_PRIORITIES`.
- **Required action:** Import `VALID_PRIORITIES` from `models` in `js/storage.js` and validate incoming priority against `VALID_PRIORITIES.includes(priority)`.

### RF-02 — Test Completeness & False Confidence
- **Reviewer severity:** SHOULD FIX
- **Human decision:** MODIFIED
- **Reason:** The reviewer classified the absence of `AC-05.4` test coverage as SHOULD FIX. However, per `SPEC.md` and `ARCHITECTURE.md`, defensive entity immutability (`Object.isFrozen`) and array mutation isolation are core system invariants. A failure here could allow callers to mutate internal repository state silently. As lead software architect, I elevate this finding from SHOULD FIX to MUST FIX.
- **Final severity:** MUST FIX
- **Required action:** Add comprehensive automated unit test in `tests/notes.test.mjs` verifying `AC-05.4: should preserve entity immutability and ensure modifying the returned array does not mutate repository state`.

### RF-03 — Maintainability & Type Documentation
- **Reviewer severity:** OPTIONAL
- **Human decision:** DEFERRED
- **Reason:** The existing method `filterByCategory` currently uses `@param {string} category`. Changing only `filterByPriority` to union literals creates type documentation inconsistency across the module. A project-wide JSDoc/TypeScript definition migration is planned in the backlog.
- **Required action:** Defer to future typing improvement task. No blocking action required for CR-02.

## Human Gate
- [x] Return to coder-agent
- [ ] Ready for final re-review
- [ ] Stop / escalate
