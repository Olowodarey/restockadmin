import { config } from "@/lib/config";

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
}

export class APIClient {
  private baseUrl: string;
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  /**
   * Set the authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Set callback for 401 responses
   */
  setUnauthorizedHandler(handler: () => void): void {
    this.onUnauthorized = handler;
  }

  /**
   * Make an HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add Authorization header if token is set
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error("API request unauthorized (401)");
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        throw new Error("Unauthorized");
      }

      // Parse response
      const data = await response.json();

      // Handle non-2xx responses
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data as T;
    } catch (error) {
      console.error(`API request failed: ${options.method} ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Export singleton API client instance
export const apiClient = new APIClient(config.apiBaseUrl);
