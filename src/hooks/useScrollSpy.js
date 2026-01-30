import { useEffect } from 'react'

/**
 * Resolves the top offset for a section element.
 *
 * @param {Element} element - Section DOM element.
 * @returns {number} Top offset relative to the document.
 * @throws {Error} Throws when element is missing.
 */
function getSectionTop(element) {
  if (!element) {
    throw new Error('Section element is required.')
  }
  const rect = element.getBoundingClientRect()
  return rect.top + window.scrollY
}

/**
 * Determines the current section based on scroll position.
 *
 * @param {string[]} sections - Section hash list.
 * @param {number} scrollPosition - Current scroll position.
 * @returns {string} Active section hash.
 * @throws {Error} Throws when sections are missing.
 */
function resolveCurrentSection(sections, scrollPosition) {
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error('Sections are required to resolve the active hash.')
  }

  return sections.reduce((current, hash) => {
    const element = document.querySelector(hash)
    if (!element) return current
    const elementTop = getSectionTop(element)
    if (scrollPosition >= elementTop - 200) {
      return hash
    }
    return current
  }, sections[0])
}

/**
 * Updates the active hash in state and browser history.
 *
 * @param {Object} params - Update options.
 * @param {string} params.currentSection - Newly active section hash.
 * @param {string} params.activeHash - Current active hash.
 * @param {(hash: string) => void} params.setActiveHash - State setter.
 * @returns {void}
 */
function updateActiveHash({ currentSection, activeHash, setActiveHash }) {
  if (currentSection === activeHash) return
  setActiveHash(currentSection)
  if (history.replaceState) {
    history.replaceState(null, '', currentSection)
  }
}

/**
 * Tracks the visible section and updates the active hash.
 *
 * @param {Object} options - Hook options.
 * @param {boolean} options.isPortal - Whether the current view is the portal.
 * @param {string[]} options.sections - List of section hashes to observe.
 * @param {string} options.activeHash - Current active hash.
 * @param {(hash: string) => void} options.setActiveHash - Hash setter.
 * @returns {void}
 * @throws {Error} Throws when required options are missing.
 */
export function useScrollSpy({
  isPortal,
  sections,
  activeHash,
  setActiveHash,
}) {
  useEffect(() => {
    if (!Array.isArray(sections) || typeof setActiveHash !== 'function') {
      throw new Error('Scrollspy requires sections and a setter.')
    }
    if (isPortal) return
    let ticking = false

    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 150
      const currentSection = resolveCurrentSection(sections, scrollPosition)
      updateActiveHash({ currentSection, activeHash, setActiveHash })
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection)
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateActiveSection()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeHash, isPortal, sections, setActiveHash])
}
