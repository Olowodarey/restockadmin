/**
 * Environment configuration loader and validator
 * Reads and validates required environment variables
 */

interface Config {
  apiBaseUrl: string;
  googleClientId: string;
}

function loadConfig(): Config {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Validate required environment variables
  if (!apiBaseUrl) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_API_BASE_URL"
    );
  }

  if (!googleClientId) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_GOOGLE_CLIENT_ID"
    );
  }

  return {
    apiBaseUrl,
    googleClientId,
  };
}

// Export singleton config instance
export const config = loadConfig();
