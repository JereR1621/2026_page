import React, { useEffect, useMemo, useRef } from 'react'
import {
  filterNavItems,
  filterNewsItems,
  hasSearchResults,
  normalizeQuery,
} from '../utils/search.js'

/**
 * Provides focus management for the search input.
 *
 * @param {boolean} isOpen - Whether the search dialog is open.
 * @param {React.RefObject<HTMLInputElement>} inputRef - Input reference.
 * @returns {void}
 * @throws {Error} Throws when the ref is missing.
 */
function useSearchInputFocus(isOpen, inputRef) {
  useEffect(() => {
    if (!isOpen) return
    if (!inputRef?.current) {
      throw new Error('Search input ref is required for focus management.')
    }
    inputRef.current.focus()
  }, [isOpen, inputRef])
}

/**
 * Adds escape key support to close the dialog.
 *
 * @param {boolean} isOpen - Whether the search dialog is open.
 * @param {() => void} onClose - Close handler for the dialog.
 * @returns {void}
 * @throws {Error} Throws when onClose is not a function.
 */
function useEscapeKey(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return
    if (typeof onClose !== 'function') {
      throw new Error('onClose must be a function for escape handling.')
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
}

/**
 * Renders the search dialog header.
 *
 * @param {Object} props - Component props.
 * @param {() => void} props.onClose - Close handler for the dialog.
 * @returns {JSX.Element} Header markup.
 * @throws {Error} Throws when onClose is missing.
 */
function SearchHeader({ onClose }) {
  if (!onClose) {
    throw new Error('Search header requires an onClose handler.')
  }
  return (
    <div className="search-modal__header">
      <div>
        <p className="search-modal__eyebrow">Búsqueda rápida</p>
        <h2>Encuentra secciones y noticias</h2>
      </div>
      <button className="search-modal__close" type="button" onClick={onClose}>
        Cerrar
      </button>
    </div>
  )
}

/**
 * Renders the search input field.
 *
 * @param {Object} props - Component props.
 * @param {string} props.value - Current search query.
 * @param {(value: string) => void} props.onChange - Change handler.
 * @param {React.RefObject<HTMLInputElement>} props.inputRef - Input reference.
 * @returns {JSX.Element} Input markup.
 * @throws {Error} Throws when onChange is missing.
 */
function SearchField({ value, onChange, inputRef }) {
  if (typeof onChange !== 'function') {
    throw new Error('Search field requires an onChange handler.')
  }
  return (
    <label className="search-field">
      <span className="visually-hidden">Buscar en el sitio</span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por secciones, noticias o temas"
      />
    </label>
  )
}

/**
 * Renders the empty state for search results.
 *
 * @returns {JSX.Element} Empty state markup.
 * @throws {Error} None.
 */
function SearchEmptyState() {
  return (
    <div className="search-empty">
      <p>No encontramos resultados para tu búsqueda.</p>
      <p>Intenta con un término distinto o revisa las secciones principales.</p>
    </div>
  )
}

/**
 * Renders the search results grouped by content type.
 *
 * @param {Object} props - Component props.
 * @param {Array<{href: string, label: string}>} props.navItems - Navigation results.
 * @param {Array<{id?: string|number, titulo: string, resumen?: string}>} props.newsItems - News results.
 * @param {(href: string) => void} props.onNavigate - Navigation callback.
 * @returns {JSX.Element} Results markup.
 * @throws {Error} Throws when navigation callback is missing.
 */
function SearchResults({ navItems, newsItems, onNavigate }) {
  if (typeof onNavigate !== 'function') {
    throw new Error('Search results require a navigation handler.')
  }
  return (
    <div className="search-results">
      <div className="search-results__group">
        <p className="search-results__title">Secciones</p>
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate(item.href)
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="search-results__group">
        <p className="search-results__title">Noticias</p>
        <ul>
          {newsItems.map((item) => (
            <li key={item.id ?? item.titulo}>
              <a
                href="#noticias"
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate('#noticias')
                }}
              >
                <span>{item.titulo}</span>
                {item.resumen ? <small>{item.resumen}</small> : null}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Builds memoized search results for the overlay.
 *
 * @param {string} query - Current search query.
 * @param {Array<{href: string, label: string}>} navItems - Navigation data.
 * @param {Array<{titulo: string}>} news - News data.
 * @returns {Object} Search results payload.
 * @throws {Error} Throws when query normalization fails.
 */
function useSearchResults(query, navItems, news) {
  const normalizedQuery = useMemo(() => normalizeQuery(query), [query])
  const navResults = useMemo(
    () => filterNavItems(navItems, normalizedQuery),
    [navItems, normalizedQuery],
  )
  const newsResults = useMemo(
    () => filterNewsItems(news, normalizedQuery),
    [news, normalizedQuery],
  )
  const showResults = hasSearchResults(navResults, newsResults)

  return { navResults, newsResults, showResults }
}

/**
 * Renders the search modal dialog container.
 *
 * @param {Object} props - Component props.
 * @param {() => void} props.onClose - Close handler.
 * @param {string} props.query - Current search query.
 * @param {(value: string) => void} props.onChangeQuery - Query change handler.
 * @param {React.RefObject<HTMLInputElement>} props.inputRef - Input reference.
 * @param {Array<{href: string, label: string}>} props.navResults - Navigation results.
 * @param {Array<{id?: string|number, titulo: string, resumen?: string}>} props.newsResults - News results.
 * @param {boolean} props.showResults - Whether results exist.
 * @param {(href: string) => void} props.onNavigate - Navigation callback.
 * @returns {JSX.Element} Modal markup.
 * @throws {Error} Throws when required props are missing.
 */
function SearchDialog({
  onClose,
  query,
  onChangeQuery,
  inputRef,
  navResults,
  newsResults,
  showResults,
  onNavigate,
}) {
  if (!inputRef) {
    throw new Error('Search dialog requires an input ref.')
  }
  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Buscar en el sitio" id="site-search">
      <div className="search-overlay__backdrop" onClick={onClose} />
      <div className="search-modal" role="document">
        <SearchHeader onClose={onClose} />
        <SearchField value={query} onChange={onChangeQuery} inputRef={inputRef} />
        {showResults ? (
          <SearchResults navItems={navResults} newsItems={newsResults} onNavigate={onNavigate} />
        ) : (
          <SearchEmptyState />
        )}
      </div>
    </div>
  )
}

/**
 * Search overlay dialog used by the header search button.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is visible.
 * @param {() => void} props.onClose - Close handler.
 * @param {string} props.query - Current search query.
 * @param {(value: string) => void} props.onChangeQuery - Query change handler.
 * @param {Array<{href: string, label: string}>} props.navItems - Navigation data.
 * @param {Array<{id?: string|number, titulo: string, resumen?: string}>} props.news - News data.
 * @param {(href: string) => void} props.onNavigate - Navigation callback.
 * @returns {JSX.Element|null} Search overlay markup or null.
 * @throws {Error} Throws when required props are missing.
 */
export default function SearchOverlay({
  open,
  onClose,
  query,
  onChangeQuery,
  navItems,
  news,
  onNavigate,
}) {
  const inputRef = useRef(null)
  useSearchInputFocus(open, inputRef)
  useEscapeKey(open, onClose)

  if (!open) return null

  const { navResults, newsResults, showResults } = useSearchResults(query, navItems, news)

  return (
    <SearchDialog
      onClose={onClose}
      query={query}
      onChangeQuery={onChangeQuery}
      inputRef={inputRef}
      navResults={navResults}
      newsResults={newsResults}
      showResults={showResults}
      onNavigate={onNavigate}
    />
  )
}
