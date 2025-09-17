// Enhanced X Token Manager - Proactive token refresh and validation

interface XTokenData {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenExpiry: string
}

interface TokenRefreshResult {
  accessToken: string
  shouldUpdate: boolean
  newTokenData?: XTokenData
  error?: string
}

export async function refreshXToken(refreshToken: string, retryCount = 0): Promise<XTokenData> {
  const maxRetries = 3

  try {
    console.log(`[X Token Manager] Attempting token refresh (attempt ${retryCount + 1}/${maxRetries + 1})`)

    const response = await fetch("/api/x/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to refresh token")
    }

    console.log(`[X Token Manager] Token refresh successful, expires in ${data.expires_in} seconds`)

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenExpiry: data.token_expiry,
    }
  } catch (error: any) {
    console.error(`[X Token Manager] Token refresh failed (attempt ${retryCount + 1}):`, error)

    if (retryCount < maxRetries && isRetryableError(error)) {
      const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
      console.log(`[X Token Manager] Retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return refreshXToken(refreshToken, retryCount + 1)
    }

    throw new Error(error.message || "Failed to refresh X token after multiple attempts")
  }
}

function isRetryableError(error: any): boolean {
  const retryableMessages = ["network error", "timeout", "connection reset", "temporary failure", "rate limit"]

  const errorMessage = error.message?.toLowerCase() || ""
  return retryableMessages.some((msg) => errorMessage.includes(msg))
}

export function isTokenExpired(tokenExpiry: string, bufferMinutes = 15): boolean {
  try {
    const expiryDate = new Date(tokenExpiry)
    const now = new Date()

    const bufferTime = bufferMinutes * 60 * 1000
    const isExpired = now.getTime() + bufferTime >= expiryDate.getTime()

    if (isExpired) {
      console.log(
        `[X Token Manager] Token will expire at ${expiryDate.toISOString()}, current time: ${now.toISOString()}`,
      )
    }

    return isExpired
  } catch (error) {
    console.error("[X Token Manager] Error checking token expiry:", error)
    return true // Assume expired if we can't parse the date
  }
}

export async function getValidXToken(
  currentToken: string,
  refreshToken: string,
  tokenExpiry: string,
  forceRefresh = false,
): Promise<TokenRefreshResult> {
  try {
    // Check if token needs refresh (with 30-minute buffer for safety)
    if (forceRefresh || isTokenExpired(tokenExpiry, 30)) {
      console.log("[X Token Manager] Token refresh needed - starting refresh process...")

      const newTokenData = await refreshXToken(refreshToken)
      return {
        accessToken: newTokenData.accessToken,
        shouldUpdate: true,
        newTokenData,
      }
    }

    // Validate token health with X API
    const isHealthy = await validateTokenHealth(currentToken)
    if (!isHealthy) {
      console.log("[X Token Manager] Token failed health check - refreshing...")

      const newTokenData = await refreshXToken(refreshToken)
      return {
        accessToken: newTokenData.accessToken,
        shouldUpdate: true,
        newTokenData,
      }
    }

    // Token is still valid and healthy
    return {
      accessToken: currentToken,
      shouldUpdate: false,
    }
  } catch (error: any) {
    console.error("[X Token Manager] Failed to get valid token:", error)
    return {
      accessToken: currentToken,
      shouldUpdate: false,
      error: error.message || "Failed to refresh token",
    }
  }
}

async function validateTokenHealth(accessToken: string, retryCount = 0): Promise<boolean> {
  const maxRetries = 2

  try {
    const response = await fetch("https://api.twitter.com/2/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.status === 429) {
      // Rate limited - wait and retry
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000
        console.log(`[X Token Manager] Rate limited, retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return validateTokenHealth(accessToken, retryCount + 1)
      }
    }

    return response.ok
  } catch (error) {
    console.error("[X Token Manager] Token health check failed:", error)

    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000
      console.log(`[X Token Manager] Network error, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return validateTokenHealth(accessToken, retryCount + 1)
    }

    return false
  }
}

export class XTokenScheduler {
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map()

  // Schedule proactive token refresh
  scheduleTokenRefresh(userId: string, tokenExpiry: string, refreshCallback: () => Promise<void>): void {
    // Clear existing schedule for this user
    this.clearTokenRefresh(userId)

    try {
      const expiryDate = new Date(tokenExpiry)
      const now = new Date()

      // Schedule refresh 30 minutes before expiry
      const refreshTime = expiryDate.getTime() - 30 * 60 * 1000
      const delay = refreshTime - now.getTime()

      if (delay > 0) {
        console.log(
          `[X Token Scheduler] Scheduling token refresh for user ${userId} in ${Math.round(delay / 1000 / 60)} minutes`,
        )

        const timeoutId = setTimeout(async () => {
          try {
            console.log(`[X Token Scheduler] Executing scheduled refresh for user ${userId}`)
            await refreshCallback()
          } catch (error) {
            console.error(`[X Token Scheduler] Scheduled refresh failed for user ${userId}:`, error)
          }
        }, delay)

        this.refreshIntervals.set(userId, timeoutId)
      } else {
        console.log(`[X Token Scheduler] Token for user ${userId} needs immediate refresh`)
        // Execute immediately if already past refresh time
        refreshCallback().catch((error) => {
          console.error(`[X Token Scheduler] Immediate refresh failed for user ${userId}:`, error)
        })
      }
    } catch (error) {
      console.error(`[X Token Scheduler] Failed to schedule refresh for user ${userId}:`, error)
    }
  }

  // Clear scheduled refresh for a user
  clearTokenRefresh(userId: string): void {
    const existingTimeout = this.refreshIntervals.get(userId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.refreshIntervals.delete(userId)
      console.log(`[X Token Scheduler] Cleared scheduled refresh for user ${userId}`)
    }
  }

  // Get status of all scheduled refreshes
  getScheduledRefreshes(): string[] {
    return Array.from(this.refreshIntervals.keys())
  }
}

export const xTokenScheduler = new XTokenScheduler()

export function getTimeUntilExpiry(tokenExpiry: string): {
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
} {
  try {
    const expiryDate = new Date(tokenExpiry)
    const now = new Date()
    const diffMs = expiryDate.getTime() - now.getTime()

    if (diffMs <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 }
    }

    const totalSeconds = Math.floor(diffMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return { hours, minutes, seconds, totalSeconds }
  } catch (error) {
    console.error("[X Token Manager] Error calculating time until expiry:", error)
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 }
  }
}
