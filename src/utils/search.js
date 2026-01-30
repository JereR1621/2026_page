/**
 * Normalizes user input for search comparisons.
 *
 * @param {string} value - Raw query string from the user.
 * @returns {string} Normalized query string in lowercase.
 * @throws {Error} Throws when the input is not a string.
 */
export function normalizeQuery(value) {
  if (typeof value !== 'string') {
    throw new Error('Search query must be a string.')
  }

  return value.trim().toLowerCase()
}

/**
 * Filters navigation items by a normalized query.
 *
 * @param {Array<{href: string, label: string}>} items - Navigation items to filter.
 * @param {string} query - Normalized query string.
 * @returns {Array<{href: string, label: string}>} Filtered navigation items.
 * @throws {Error} Throws when items is not an array.
 */
export function filterNavItems(items, query) {
  if (!Array.isArray(items)) {
    throw new Error('Navigation items must be an array.')
  }

  if (!query) {
    return items
  }

  return items.filter((item) => item.label.toLowerCase().includes(query))
}

/**
 * Filters news items by a normalized query or returns a default subset.
 *
 * @param {Array<{titulo: string}>} items - News items to filter.
 * @param {string} query - Normalized query string.
 * @param {number} fallbackCount - Number of items to return when query is empty.
 * @returns {Array<{titulo: string}>} Filtered news items.
 * @throws {Error} Throws when items is not an array.
 */
export function filterNewsItems(items, query, fallbackCount = 3) {
  if (!Array.isArray(items)) {
    throw new Error('News items must be an array.')
  }

  if (!query) {
    return items.slice(0, fallbackCount)
  }

  return items.filter((item) => item.titulo.toLowerCase().includes(query))
}

/**
 * Determines if there are any search results to display.
 *
 * @param {Array} navItems - Filtered navigation results.
 * @param {Array} newsItems - Filtered news results.
 * @returns {boolean} True when there are results to show.
 * @throws {Error} Throws when inputs are not arrays.
 */
export function hasSearchResults(navItems, newsItems) {
  if (!Array.isArray(navItems) || !Array.isArray(newsItems)) {
    throw new Error('Search results must be arrays.')
  }

  return navItems.length > 0 || newsItems.length > 0
}
