import assert from 'node:assert/strict'
import test from 'node:test'
import {
  filterNavItems,
  filterNewsItems,
  hasSearchResults,
  normalizeQuery,
} from './search.js'

test('normalizeQuery trims and lowercases input', () => {
  assert.equal(normalizeQuery('  Hola Mundo  '), 'hola mundo')
})

test('filterNavItems returns all items for empty query', () => {
  const items = [{ href: '#inicio', label: 'Inicio' }, { href: '#carrera', label: 'Carrera' }]
  assert.deepEqual(filterNavItems(items, ''), items)
})

test('filterNavItems filters items by query', () => {
  const items = [{ href: '#inicio', label: 'Inicio' }, { href: '#contacto', label: 'Contacto' }]
  assert.deepEqual(filterNavItems(items, 'con'), [{ href: '#contacto', label: 'Contacto' }])
})

test('filterNewsItems returns fallback items without a query', () => {
  const items = [{ titulo: 'A' }, { titulo: 'B' }, { titulo: 'C' }, { titulo: 'D' }]
  assert.deepEqual(filterNewsItems(items, '', 2), [{ titulo: 'A' }, { titulo: 'B' }])
})

test('filterNewsItems filters items by query', () => {
  const items = [{ titulo: 'Ingreso 2026' }, { titulo: 'Evento' }]
  assert.deepEqual(filterNewsItems(items, 'ingreso'), [{ titulo: 'Ingreso 2026' }])
})

test('hasSearchResults returns true when there is any result', () => {
  assert.equal(hasSearchResults([{ href: '#inicio' }], []), true)
  assert.equal(hasSearchResults([], [{ titulo: 'Noticia' }]), true)
  assert.equal(hasSearchResults([], []), false)
})
