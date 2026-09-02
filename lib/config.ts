// Application configuration loader and validator

/**
 * Application configuration object
 */
export interface AppConfig {
  apiBaseUrl: string;
  googleClientId: string;
}

/**
 * Configuration error thrown when required environment variables are missing
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Validates that a required environment variable is present and non-empty
 * @param name - The name of the environment variable
 * @param value - The value of the environment variable
 * @returns The validated value
 * @throws {ConfigurationError} If the value is missing or empty
 */
function requireEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new ConfigurationError(
      `Missing required environment variable: ${name}. ` +
        `Please ensure ${name} is set in your .env.local file.`
    );
  }
  return value.trim();
}

/**
 * Load and validate application configuration from environment variables
 * @returns The validated configuration object
 * @throws {ConfigurationError} If any required configuration is missing
 */
export function loadConfig(): AppConfig {
  try {
    const apiBaseUrl = requireEnvVar(
      'NEXT_PUBLIC_API_BASE_URL',
      process.env.NEXT_PUBLIC_API_BASE_URL
    );

    const googleClientId = requireEnvVar(
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    );

    // Validate API base URL format
    try {
      new URL(apiBaseUrl);
    } catch {
      throw new ConfigurationError(
        `Invalid NEXT_PUBLIC_API_BASE_URL: "${apiBaseUrl}". Must be a valid URL.`
      );
    }

    return {
      apiBaseUrl,
      googleClientId,
    };
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    throw new ConfigurationError(
      `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Singleton configuration instance
 * Lazily loaded on first access
 */
let configInstance: AppConfig | null = null;

/**
 * Get the application configuration
 * @returns The application configuration
 * @throws {ConfigurationError} If configuration loading fails
 */
export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Reset the configuration instance (useful for testing)
 * @internal
 */
export function resetConfig(): void {
  configInstance = null;
}
