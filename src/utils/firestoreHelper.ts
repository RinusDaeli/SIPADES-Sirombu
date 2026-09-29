/**
 * Helper utilities for Firestore data cleaning and serialization.
 * Firestore rejects `undefined` values, so this utility cleans objects
 * before sending to Firestore.
 */
export function cleanObject<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => (typeof item === 'object' && item !== null ? cleanObject(item) : item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = cleanObject(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
