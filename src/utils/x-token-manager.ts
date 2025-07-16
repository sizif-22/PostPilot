// X Token Manager - Handles token refresh and validation

interface XTokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenExpiry: string;
}

export async function refreshXToken(refreshToken: string): Promise<XTokenData> {
  try {
    const response = await fetch("/api/x/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to refresh token");
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenExpiry: data.token_expiry,
    };
  } catch (error: any) {
    console.error("Error refreshing X token:", error);
    throw new Error(error.message || "Failed to refresh X token");
  }
}

export function isTokenExpired(tokenExpiry: string): boolean {
  try {
    const expiryDate = new Date(tokenExpiry);
    const now = new Date();

    // Add 5 minute buffer to refresh token before it actually expires
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return now.getTime() + bufferTime >= expiryDate.getTime();
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true; // Assume expired if we can't parse the date
  }
}

export async function getValidXToken(
  currentToken: string,
  refreshToken: string,
  tokenExpiry: string
): Promise<{
  accessToken: string;
  shouldUpdate: boolean;
  newTokenData?: XTokenData;
}> {
  // Check if token is expired or will expire soon
  if (isTokenExpired(tokenExpiry)) {
    console.log("X token is expired or will expire soon, refreshing...");

    try {
      const newTokenData = await refreshXToken(refreshToken);
      return {
        accessToken: newTokenData.accessToken,
        shouldUpdate: true,
        newTokenData,
      };
    } catch (error) {
      console.error("Failed to refresh X token:", error);
      throw new Error(
        "Failed to refresh X access token. Please reconnect your X account."
      );
    }
  }

  // Token is still valid
  return {
    accessToken: currentToken,
    shouldUpdate: false,
  };
}
