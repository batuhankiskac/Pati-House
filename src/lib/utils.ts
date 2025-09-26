import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize breed into Title Case (trim + single spaces).
 * Example: "  siamese  mix " -> "Siamese Mix"
 */
export function normalizeBreed(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Radix dialogs sometimes leave `pointer-events: none` on the body when they close.
 * Clear the inline style so the rest of the page becomes clickable again.
 */
export function restoreBodyPointerEvents(): void {
  if (typeof document === 'undefined') return;

  const { body } = document;
  if (!body) return;

  if (body.style.pointerEvents === 'none') {
    body.style.pointerEvents = '';
  }
}
