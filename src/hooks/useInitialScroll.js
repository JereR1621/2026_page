import { useEffect, useRef } from 'react'

/**
 * Performs the initial hash scroll for non-portal views.
 *
 * @param {boolean} isPortal - Whether the current view is the portal.
 * @param {(href: string) => void} scrollToHash - Scroll helper callback.
 * @returns {void}
 * @throws {Error} Throws when scroll callback is missing.
 */
export function useInitialScroll(isPortal, scrollToHash) {
  const didInitialScroll = useRef(false)

  useEffect(() => {
    if (typeof scrollToHash !== 'function') {
      throw new Error('scrollToHash callback is required.')
    }
    if (isPortal || didInitialScroll.current) return
    didInitialScroll.current = true
    const hash = window.location.hash
    if (hash) {
      setTimeout(() => scrollToHash(hash), 0)
    }
  }, [isPortal, scrollToHash])
}
