import { Session, User } from "@/types";

const STORAGE_KEYS = {
  TOKEN: "admin_token",
  USER: "admin_user",
} as const;

/**
 * Save authentication session to localStorage
 */
export function saveSession(session: Session): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, session.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session.user));
  } catch (error) {
    console.error("Failed to save session to localStorage:", error);
  }
}

/**
 * Load authentication session from localStorage
 */
export function loadSession(): Session | null {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);

    if (!token || !userJson) {
      return null;
    }

    const user: User = JSON.parse(userJson);
    return {
      accessToken: token,
      user,
    };
  } catch (error) {
    console.error("Failed to load session from localStorage:", error);
    return null;
  }
}

/**
 * Clear authentication session from localStorage
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error("Failed to clear session from localStorage:", error);
  }
}

/**
 * Validate that a token exists and is non-empty
 */
export function validateToken(token: string | null): boolean {
  return typeof token === "string" && token.trim().length > 0;
}
