/**
 * Escapes fields to prevent CSV formula injection and handles quotes/commas.
 */
export const sanitizeCsvField = (value: any): string => {
  if (value === null || value === undefined) return '""';
  let str = String(value).trim();

  // Protect against CSV injection by prepending a single quote if string starts with formula characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes inside the string
  str = str.replace(/"/g, '""');
  return `"${str}"`;
};

export const generateCsv = (headers: string[], rows: (string | number | boolean | null | undefined)[][]): string => {
  const headerLine = headers.map(sanitizeCsvField).join(',');
  const rowLines = rows.map((row) => row.map(sanitizeCsvField).join(','));
  return [headerLine, ...rowLines].join('\r\n');
};
