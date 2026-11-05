import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const models = require('../js/models.js');
const storage = require('../js/storage.js');

const { NoteModel, ValidationError, CONSTRAINTS, VALID_CATEGORIES, VALID_PRIORITIES } = models;
const { NoteRepository, StorageResult } = storage;

describe('Domain Model: NoteModel Validation & Creation', () => {
  it('should successfully create a valid note with all fields provided', () => {
    const payload = {
      title: 'Nota de Arquitectura',
      category: 'Trabajo',
      priority: 'alta',
      content: 'Diseñar el módulo de persistencia inmutable.'
    };

    const validation = NoteModel.validate(payload);
    assert.equal(validation.valid, true);
    assert.deepEqual(validation.errors, {});
    assert.ok(validation.data);
    assert.equal(validation.data.title, 'Nota de Arquitectura');
    assert.equal(validation.data.category, 'Trabajo');
    assert.equal(validation.data.priority, 'alta');

    const note = NoteModel.create(payload);
    assert.ok(note.id);
    assert.equal(note.title, 'Nota de Arquitectura');
    assert.equal(note.content, 'Diseñar el módulo de persistencia inmutable.');
    assert.ok(!Number.isNaN(Date.parse(note.createdAt)));
    assert.equal(NoteModel.isNoteEntity(note), true);
  });

  it('should reject titles shorter than minimum constraint', () => {
    const payload = {
      title: 'Ab',
      content: 'Contenido válido de la nota.'
    };
    const validation = NoteModel.validate(payload);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.title);
    assert.throws(
      () => NoteModel.create(payload),
      ValidationError
    );
  });

  it('should trim whitespace from title and content', () => {
    const payload = {
      title: '   Título con espacios   ',
      category: 'Ideas',
      content: '   Cuerpo de la nota con espacios alrededor.   '
    };
    const note = NoteModel.create(payload);
    assert.equal(note.title, 'Título con espacios');
    assert.equal(note.content, 'Cuerpo de la nota con espacios alrededor.');
  });

  it('should reject whitespace-only titles', () => {
    const payload = {
      title: '       ',
      content: 'Contenido válido de prueba.'
    };
    const validation = NoteModel.validate(payload);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.title);
  });

  it('should fallback to defaults for unknown category or priority', () => {
    const payload = {
      title: 'Nota con categoría desconocida',
      category: 'CategoriaInexistente',
      priority: 'prioridadInvalida',
      content: 'Texto suficientemente largo de prueba.'
    };
    const note = NoteModel.create(payload);
    assert.equal(note.category, 'General');
    assert.equal(note.priority, 'media');
  });

  it('should reject content shorter than minimum constraint', () => {
    const payload = {
      title: 'Título Válido',
      content: '123'
    };
    const validation = NoteModel.validate(payload);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.content);
  });

  it('should guarantee that note entities are frozen (immutable)', () => {
    const note = NoteModel.create({
      title: 'Nota Inmutable',
      content: 'Esta nota no debe permitir mutación de atributos.'
    });
    assert.ok(Object.isFrozen(note));
    assert.throws(() => {
      // @ts-ignore
      note.title = 'Nuevo título';
    }, TypeError);
  });
});

describe('Architectural Invariant: No Deletion Capability', () => {
  it('should verify NoteRepository strictly exposes no delete or remove method', () => {
    const repo = new NoteRepository();
    const prototypeProps = Object.getOwnPropertyNames(Object.getPrototypeOf(repo));

    const forbiddenTerms = ['delete', 'remove', 'destroy', 'clear', 'drop', 'truncate', 'pop'];
    for (const term of forbiddenTerms) {
      const match = prototypeProps.find((prop) => prop.toLowerCase().includes(term));
      assert.equal(
        match,
        undefined,
        `Violación de invariante: se detectó el método '${match}' en NoteRepository.`
      );
    }
  });
});

describe('Persistence: NoteRepository In-Memory Fallback', () => {
  it('should store and retrieve notes in chronological descending order', () => {
    const repo = new NoteRepository();
    assert.equal(repo.isUsingFallback(), true); // En Node.js window.localStorage no existe

    const note1 = NoteModel.create({
      title: 'Primera Nota',
      content: 'Primer contenido de prueba'
    });

    const note2 = NoteModel.create({
      title: 'Segunda Nota',
      content: 'Segundo contenido de prueba'
    });

    const res1 = repo.saveNote(note1);
    assert.equal(res1.success, true);

    const res2 = repo.saveNote(note2);
    assert.equal(res2.success, true);

    const all = repo.getAllNotes();
    assert.equal(all.success, true);
    assert.equal(all.data.length, 2);
    // note2 fue guardada después, debe estar en la posición 0
    assert.equal(all.data[0].id, note2.id);
    assert.equal(all.data[1].id, note1.id);
  });

  it('should reject invalid entity shapes during save', () => {
    const repo = new NoteRepository();
    // @ts-ignore
    const result = repo.saveNote({ invalid: 'shape' });
    assert.equal(result.success, false);
    assert.ok(result.error);
  });
});

describe('Query & Filtering: NoteRepository Category Filtering (FR-04)', () => {
  it('AC-04.1: should retrieve notes matching a valid category in chronological descending order', async () => {
    const repo = new NoteRepository();

    const note1 = NoteModel.create({
      title: 'Nota Trabajo 1',
      category: 'Trabajo',
      content: 'Contenido de la primera nota de trabajo'
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    const note2 = NoteModel.create({
      title: 'Nota Personal',
      category: 'Personal',
      content: 'Contenido de nota personal que no debe filtrarse'
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    const note3 = NoteModel.create({
      title: 'Nota Trabajo 2',
      category: 'Trabajo',
      content: 'Contenido de la segunda nota de trabajo (más reciente)'
    });

    repo.saveNote(note1);
    repo.saveNote(note2);
    repo.saveNote(note3);

    const result = repo.filterByCategory('Trabajo');

    assert.equal(result.success, true);
    assert.equal(result.error, undefined);
    assert.equal(Array.isArray(result.data), true);
    assert.equal(result.data.length, 2);

    // Every item must have category === 'Trabajo'
    for (const note of result.data) {
      assert.equal(note.category, 'Trabajo');
    }

    // Chronological descending order (newest first: note3 then note1)
    assert.equal(result.data[0].id, note3.id);
    assert.equal(result.data[1].id, note1.id);
    assert.ok(new Date(result.data[0].createdAt).getTime() >= new Date(result.data[1].createdAt).getTime());
  });

  it('AC-04.2: should return an empty array without error when a valid category has no matching notes', () => {
    const repo = new NoteRepository();

    // 1. In an empty repository
    const emptyResult = repo.filterByCategory('Estudio');
    assert.equal(emptyResult.success, true);
    assert.deepEqual(emptyResult.data, []);
    assert.equal(emptyResult.data.length, 0);
    assert.equal(emptyResult.error, undefined);

    // 2. In a repository with notes in other categories
    const note = NoteModel.create({
      title: 'Nota de Ideas',
      category: 'Ideas',
      content: 'Una idea cualquiera para prueba'
    });
    repo.saveNote(note);

    const noMatchResult = repo.filterByCategory('Urgente');
    assert.equal(noMatchResult.success, true);
    assert.deepEqual(noMatchResult.data, []);
    assert.equal(noMatchResult.data.length, 0);
    assert.equal(noMatchResult.error, undefined);
  });

  it('AC-04.3: should reject null, undefined, non-string, empty, or unknown categories with descriptive error', () => {
    const repo = new NoteRepository();

    const invalidInputs = [
      null,
      undefined,
      42,
      true,
      false,
      {},
      [],
      '',
      '   ',
      'Inexistente',
      'trabajo', // Case sensitivity check
      'General ' // Trailing whitespace
    ];

    for (const input of invalidInputs) {
      // @ts-ignore
      const result = repo.filterByCategory(input);
      assert.equal(result.success, false, `Expected failure for input: ${String(input)}`);
      assert.equal(result.data, undefined);
      assert.equal(typeof result.error, 'string');
      assert.ok(result.error.length > 0, `Expected non-empty error string for input: ${String(input)}`);
    }

    // Also test without arguments
    // @ts-ignore
    const noArgResult = repo.filterByCategory();
    assert.equal(noArgResult.success, false);
    assert.equal(typeof noArgResult.error, 'string');
    assert.ok(noArgResult.error.length > 0);
  });

  it('AC-04.4: should preserve entity immutability and ensure modifying the returned array does not mutate repository state', () => {
    const repo = new NoteRepository();

    const note = NoteModel.create({
      title: 'Nota para Inmutabilidad',
      category: 'General',
      content: 'Probando integridad e inmutabilidad'
    });
    repo.saveNote(note);

    const filterResult = repo.filterByCategory('General');
    assert.equal(filterResult.success, true);
    assert.equal(filterResult.data.length, 1);

    const retrievedNote = filterResult.data[0];

    // Entities must remain frozen
    assert.equal(Object.isFrozen(retrievedNote), true);
    assert.throws(() => {
      // @ts-ignore
      retrievedNote.title = 'Título Modificado';
    }, TypeError);

    // Modifying the returned array must not alter repository internal state
    filterResult.data.push({ fake: 'note' });
    filterResult.data.pop();
    filterResult.data.pop();
    assert.equal(filterResult.data.length, 0);

    // Subsequent retrieval must be intact
    const freshResult = repo.filterByCategory('General');
    assert.equal(freshResult.success, true);
    assert.equal(freshResult.data.length, 1);
    assert.equal(freshResult.data[0].id, note.id);
    assert.equal(freshResult.data[0].title, 'Nota para Inmutabilidad');
  });
});


describe('Query & Filtering: NoteRepository Priority Filtering (FR-05)', () => {
  it('AC-05.1: should retrieve notes matching a valid priority in chronological descending order', async () => {
    const repo = new NoteRepository();

    const note1 = NoteModel.create({
      title: 'Nota Prioridad Alta 1',
      category: 'Trabajo',
      priority: 'alta',
      content: 'Primera tarea de alta prioridad'
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    const note2 = NoteModel.create({
      title: 'Nota Prioridad Media',
      category: 'Personal',
      priority: 'media',
      content: 'Tarea media que no debe filtrarse'
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    const note3 = NoteModel.create({
      title: 'Nota Prioridad Alta 2',
      category: 'Ideas',
      priority: 'alta',
      content: 'Segunda tarea de alta prioridad (más reciente)'
    });

    repo.saveNote(note1);
    repo.saveNote(note2);
    repo.saveNote(note3);

    const result = repo.filterByPriority('alta');

    assert.equal(result.success, true);
    assert.equal(result.error, undefined);
    assert.equal(Array.isArray(result.data), true);
    assert.equal(result.data.length, 2);

    for (const note of result.data) {
      assert.equal(note.priority, 'alta');
    }

    assert.equal(result.data[0].id, note3.id);
    assert.equal(result.data[1].id, note1.id);
    assert.ok(new Date(result.data[0].createdAt).getTime() >= new Date(result.data[1].createdAt).getTime());
  });

  it('AC-05.2: should return an empty array without error when a valid priority has no matching notes', () => {
    const repo = new NoteRepository();

    const emptyResult = repo.filterByPriority('baja');
    assert.equal(emptyResult.success, true);
    assert.deepEqual(emptyResult.data, []);
    assert.equal(emptyResult.data.length, 0);
  });

  it('AC-05.3: should reject null, undefined, non-string, empty, or unknown priorities with descriptive error', () => {
    const repo = new NoteRepository();

    const invalidInputs = [
      null,
      undefined,
      123,
      true,
      false,
      {},
      [],
      '',
      '   ',
      'urgente',
      'ALTA'
    ];

    for (const input of invalidInputs) {
      // @ts-ignore
      const result = repo.filterByPriority(input);
      assert.equal(result.success, false);
      assert.equal(typeof result.error, 'string');
      assert.ok(result.error.length > 0);
    }
  });

  it('AC-05.4: should preserve entity immutability and ensure modifying the returned array does not mutate repository state', () => {
    const repo = new NoteRepository();

    const note = NoteModel.create({
      title: 'Nota Prioridad Alta Inmutable',
      category: 'General',
      priority: 'alta',
      content: 'Probando integridad e inmutabilidad en filtro de prioridad'
    });
    repo.saveNote(note);

    const filterResult = repo.filterByPriority('alta');
    assert.equal(filterResult.success, true);
    assert.equal(filterResult.data.length, 1);

    const retrievedNote = filterResult.data[0];

    // Entities must remain frozen
    assert.equal(Object.isFrozen(retrievedNote), true);
    assert.throws(() => {
      // @ts-ignore
      retrievedNote.priority = 'baja';
    }, TypeError);

    // Modifying the returned array must not alter repository internal state
    filterResult.data.push({ fake: 'note' });
    filterResult.data.pop();
    filterResult.data.pop();
    assert.equal(filterResult.data.length, 0);

    // Subsequent retrieval must remain intact
    const freshResult = repo.filterByPriority('alta');
    assert.equal(freshResult.success, true);
    assert.equal(freshResult.data.length, 1);
    assert.equal(freshResult.data[0].id, note.id);
    assert.equal(freshResult.data[0].title, 'Nota Prioridad Alta Inmutable');
  });
});
