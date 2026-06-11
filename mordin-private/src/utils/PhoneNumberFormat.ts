/**
 * Format a phone number into the pattern xxx-xxx-xxxx
 *
 * @param phone - A string of 10 digits
 * @returns The formatted phone number, e.g. "081-234-5678"
 */
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const limited = cleaned.slice(0, 10);

  let formatted = limited;
  if (limited.length > 3)
    formatted = limited.slice(0, 3) + '-' + limited.slice(3);
  if (limited.length > 6)
    formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);

  return formatted;
}
