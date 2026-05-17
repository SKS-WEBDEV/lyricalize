import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Extracts meaningful data from an error object for logging.
 * Prevents the "empty object" logging issue in console.error.
 */
export function safeError(error: unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as any)
    };
  }
  if (typeof error === 'object' && error !== null) {
    return { ...error };
  }
  return { message: String(error) };
}