# System Requirements Specification (SRS)

## Project Overview
The Note Management Application is a modular, zero-runtime-dependency web application developed in Vanilla JavaScript (ES2022), semantic HTML5, and CSS3. The system enforces an immutable audit trail model where notes can be created and queried, but never deleted or modified once committed.

---

## Functional Requirements

### FR-01: Note Creation
- **FR-01.1:** The system shall create notes with a mandatory title, content, category, and priority.
- **FR-01.2:** Title must be between 3 and 80 characters (trimmed).
- **FR-01.3:** Content must be between 5 and 1000 characters (trimmed).
- **FR-01.4:** Allowed categories are restricted to: `General`, `Trabajo`, `Estudio`, `Personal`, `Ideas`, `Urgente`.
- **FR-01.5:** Allowed priority levels are restricted to: `baja`, `media`, `alta`.
- **FR-01.6:** If category or priority is not provided or unknown, defaults shall be applied (`General` and `media` respectively).

### FR-02: Defensive Entity Immutability
- **FR-02.1:** Each created note entity must be assigned a unique ID (`crypto.randomUUID` or RFC4122-compliant fallback) and an ISO8601 UTC creation timestamp (`createdAt`).
- **FR-02.2:** All generated note entity objects must be frozen via `Object.freeze()` to prevent mutation of properties at runtime.

### FR-03: Note Retrieval
- **FR-03.1:** The storage repository shall provide an operation `getAllNotes()` returning all persisted notes.
- **FR-03.2:** Notes must always be returned in chronological descending order (newest note first).

### FR-04: Category-Based Note Filtering
- **FR-04.1:** The storage repository shall provide an operation `filterByCategory(category)` to retrieve notes matching a specific valid category.
- **FR-04.2:** Filtered notes must preserve chronological descending sorting (`createdAt` descending).
- **FR-04.3:** If no notes exist in a valid category, the operation shall return an empty collection without error.
- **FR-04.4:** The filter operation must reject invalid, empty, or non-string category arguments with a descriptive validation error.
- **FR-04.5:** The filter operation shall return frozen entities and preserve storage integrity.

### FR-05: Priority-Based Note Filtering
- **FR-05.1:** The storage repository shall provide an operation `filterByPriority(priority)` to retrieve notes matching a specific valid priority level.
- **FR-05.2:** Filtered notes must preserve chronological descending sorting (`createdAt` descending).
- **FR-05.3:** If no notes exist in a valid priority, the operation shall return an empty collection without error (`StorageResult.ok([])`).
- **FR-05.4:** The filter operation must reject invalid, empty, non-string, or unknown priority arguments with a descriptive validation error (`StorageResult.fail(...)`).
- **FR-05.5:** The filter operation shall return frozen entities and preserve storage integrity and immutability.

---

## Non-Functional Requirements & Architectural Invariants

### NFR-01: Creation-Only Architectural Invariant
- **NFR-01.1:** The domain and storage layers shall strictly omit and prohibit any deletion, removal, truncation, or destruction methods (`delete`, `remove`, `destroy`, `clear`, `truncate`, `pop`).
- **NFR-01.2:** The application interface and repository API shall never expose any mechanism to delete recorded notes.

### NFR-02: Zero External Runtime Dependencies
- **NFR-02.1:** The core application must run directly in standard modern browsers without build tools, bundlers, or third-party runtime libraries.

### NFR-03: Resilient Persistence with Fallback
- **NFR-03.1:** The repository shall persist notes to browser `localStorage` under key `ada07_notes_v1`.
- **NFR-03.2:** If `localStorage` is unavailable, blocked by browser policy, or quota is exceeded, the repository shall automatically fall back to an in-memory store without crashing.
