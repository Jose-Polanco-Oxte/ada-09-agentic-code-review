# Technical Specification & Acceptance Criteria (SPEC)

## 1. Domain Model: NoteModel (`js/models.js`)

### AC-01.1: Successful Note Creation
- **Traceability:** Maps to FR-01.1, FR-01.2, FR-01.3, FR-02.1
- **Criteria:** Given a valid payload with title, category, priority, and content, `NoteModel.create(payload)` returns a frozen object containing a valid string `id`, `title`, `category`, `priority`, `content`, and a valid parseable `createdAt` ISO timestamp.

### AC-01.2: Boundary Length Validation
- **Traceability:** Maps to FR-01.2, FR-01.3
- **Criteria:**
  - Titles shorter than 3 characters or longer than 80 characters trigger a `ValidationError`.
  - Content shorter than 5 characters or longer than 1000 characters trigger a `ValidationError`.
  - Whitespace-only titles or content trigger a `ValidationError`.

### AC-01.3: Default Value Fallbacks
- **Traceability:** Maps to FR-01.4, FR-01.5, FR-01.6
- **Criteria:** Providing an unrecognized category defaults to `'General'`. Providing an unrecognized priority defaults to `'media'`.

### AC-02.1: Entity Immutability
- **Traceability:** Maps to FR-02.2
- **Criteria:** `Object.isFrozen(note)` evaluates to `true`. Attempting to assign or mutate any property on `note` throws a `TypeError` in strict mode.

---

## 2. Storage Repository: NoteRepository (`js/storage.js`)

### AC-03.1: Chronological Retrieval
- **Traceability:** Maps to FR-03.1, FR-03.2
- **Criteria:** `repo.getAllNotes()` returns a `StorageResult` with `success === true` and `data` containing an array of notes sorted so that for all `i < j`, `new Date(data[i].createdAt) >= new Date(data[j].createdAt)`.

### AC-04.1: Query by Valid Category
- **Traceability:** Maps to FR-04.1, FR-04.2
- **Criteria:** Given a valid category string (e.g. `'Trabajo'`), `repo.filterByCategory('Trabajo')` returns a `StorageResult` where `success === true` and every element in `data` has `category === 'Trabajo'`. The returned elements must be in chronological descending order.

### AC-04.2: Empty Match Handling
- **Traceability:** Maps to FR-04.3
- **Criteria:** When filtering by a valid category that contains zero saved notes, `repo.filterByCategory(category)` returns `StorageResult.ok([])` with `data.length === 0`.

### AC-04.3: Parameter Validation
- **Traceability:** Maps to FR-04.4
- **Criteria:** Calling `filterByCategory()` with `null`, `undefined`, a non-string argument, an empty string, or an unknown category not in `VALID_CATEGORIES` returns a `StorageResult` with `success === false` and a descriptive error message in `result.error`.

### AC-04.4: Invariant & Immutability Preservation
- **Traceability:** Maps to FR-04.5, NFR-01.1
- **Criteria:** Modifying the array returned by `filterByCategory()` does not modify internal state. All entities in `data` are frozen.

### AC-05.1: Query by Valid Priority
- **Traceability:** Maps to FR-05.1, FR-05.2
- **Criteria:** Given a valid priority string ('baja', 'media', 'alta'), `repo.filterByPriority(priority)` returns a `StorageResult` where `success === true` and every element in `data` has `priority === priority`. The returned elements must be in chronological descending order.

### AC-05.2: Empty Match Handling
- **Traceability:** Maps to FR-05.3
- **Criteria:** When filtering by a valid priority that contains zero saved notes, `repo.filterByPriority(priority)` returns `StorageResult.ok([])` with `data.length === 0`.

### AC-05.3: Parameter Validation
- **Traceability:** Maps to FR-05.4
- **Criteria:** Calling `filterByPriority()` with `null`, `undefined`, a non-string argument, an empty string, or an unknown priority not in `VALID_PRIORITIES` returns a `StorageResult` with `success === false` and a descriptive error message in `result.error`.

### AC-05.4: Invariant & Immutability Preservation
- **Traceability:** Maps to FR-05.5, NFR-01.1
- **Criteria:** Modifying the array returned by `filterByPriority()` does not modify internal state. All entities in `data` are frozen.

### AC-NFR-01: Prohibition of Deletion Operations
- **Traceability:** Maps to NFR-01.1, NFR-01.2
- **Criteria:** Introspecting `Object.getOwnPropertyNames(Object.getPrototypeOf(repo))` confirms that no property or method name contains: `'delete'`, `'remove'`, `'destroy'`, `'clear'`, `'drop'`, `'truncate'`, or `'pop'`.
