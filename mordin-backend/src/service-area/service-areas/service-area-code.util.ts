/**
 * Single source of truth for service-area "code" normalization.
 *
 * Both the standalone service-areas endpoint and the factory endpoint create
 * service areas; they must store codes identically, otherwise the unique
 * (code, factory_id) constraint and checkCodes() availability checks diverge.
 */
export function normalizeServiceAreaCode(code: string): string {
  return code.trim().toUpperCase();
}
