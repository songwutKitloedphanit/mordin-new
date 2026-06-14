export interface IdentificationNumberFormat {
  /**
   * Thai National ID represented as a 13-digit numeric string
   */
  thaiNationalId: string;
}

/**
 * Format a Thai national ID into the pattern x-xxxx-xxxxx-xx-x
 *
 * @param thaiNationalId - A string of 13 digits representing a Thai ID
 * @returns The formatted ID, e.g. "1-2345-67890-12-3"
 * @throws Error if the input does not contain exactly 13 digits
 */
export function formatThaiNationalId(thaiNationalId: string | null): string {
  // Remove any non-digit characters
  if (thaiNationalId == null || '') {
    return '-';
  }
  const digits = thaiNationalId.replace(/\D/g, '');

  const part1 = digits.slice(0, 1);
  const part2 = digits.slice(1, 5);
  const part3 = digits.slice(5, 10);
  const part4 = digits.slice(10, 12);
  const part5 = digits.slice(12);

  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}
