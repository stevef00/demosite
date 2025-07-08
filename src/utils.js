export function highlightMatch(text, filter) {
  if (!filter) return text;
  const regex = new RegExp(`(${filter.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="match-highlight">$1</span>');
}

export function sortTitles(list) {
  return [...list].sort((a, b) => a.localeCompare(b));
}
