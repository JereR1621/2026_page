import { useEffect, useState } from 'react'

/**
 * Manages search overlay state and side effects.
 *
 * @returns {Object} Search state helpers.
 * @throws {Error} Throws when document is unavailable.
 */
export function useSearchState() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (typeof document === 'undefined') {
      throw new Error('Search state requires access to the document.')
    }
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) setQuery('')
  }, [isOpen])

  return {
    isOpen,
    query,
    openSearch: () => setIsOpen(true),
    closeSearch: () => setIsOpen(false),
    setQuery,
  }
}
