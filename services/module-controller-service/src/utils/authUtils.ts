import jwt from "jsonwebtoken";
import logger from "./logger";

/**
 * Generates a JWT token for service-to-service authentication
 * @returns A JWT token or null if generation fails
 */
export function generateServiceToken(): string | null {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      logger.error("[Auth] JWT_SECRET environment variable is not set");
      return null;
    }

    // Create a token that identifies this service
    const token = jwt.sign(
      { service: "module-controller-service" },
      jwtSecret,
      { expiresIn: "1h" }
    );

    logger.debug("[Auth] Generated new service JWT token");
    return token;
  } catch (error) {
    logger.error(
      `[Auth] Error generating JWT token: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return null;
  }
}

/**
 * Gets the authorization header value with Bearer token
 * @returns Authorization header value or null if token generation fails
 */
export function getAuthHeader(): string | null {
  const token = generateServiceToken();
  if (!token) return null;
  return `Bearer ${token}`;
}
