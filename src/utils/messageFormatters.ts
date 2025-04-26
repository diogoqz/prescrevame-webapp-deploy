
/**
 * Utility functions for formatting chat messages
 */

/**
 * Formats message text by replacing escaped characters and applying markdown styling
 */
export const formatMessage = (text: string): string => {
  // Replace escaped characters and format markdown-style text
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
};
