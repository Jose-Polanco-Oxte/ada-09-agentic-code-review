# Change Request

Change ID: CR-02

## Goal
Implement priority-based note filtering (`filterByPriority(priority)`) in `NoteRepository` (`js/storage.js`) to allow retrieving notes matching a specified priority level ('baja', 'media', 'alta'), preserving chronological descending sort order and defensive entity immutability.

## Requirements Covered
- FR-05 (FR-05.1, FR-05.2, FR-05.3, FR-05.4, FR-05.5)
- AC-05 (AC-05.1, AC-05.2, AC-05.3, AC-05.4)
- FR-01.5 (Allowed priorities: 'baja', 'media', 'alta')
- NFR-01 (Creation-Only Architectural Invariant)

## Constraints
- Follow AGENTS.md.
- Use REQUIREMENTS.md and SPEC.md as the source of truth.
- Preserve architecture boundaries.
- Do not weaken existing tests.

## Verification
Automated test suite execution in `tests/notes.test.mjs` verifying AC-05.1 through AC-05.4, code syntax verification via `node --check`, contract validation via `python scripts/check_repo_contract.py`, and unified verification pipeline via `./scripts/verify_repo.ps1` / `./scripts/verify_repo.sh`.

## Human Approval
Approved to implement: YES
Approved by: Antonio Polanco (Lead Software Engineer / Human Reviewer)
Date: 2026-11-04
