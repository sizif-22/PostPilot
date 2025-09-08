import { NextResponse } from "next/server"
import { refreshXToken } from "@/utils/x-token-manager"
import { db } from "@/firebase/config"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    const { refreshToken, userId } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    console.log(`[Proactive Refresh] Starting proactive refresh for user ${userId || "unknown"}`)

    // Perform the token refresh
    const newTokenData = await refreshXToken(refreshToken)

    console.log(`[Proactive Refresh] Successfully refreshed token for user ${userId || "unknown"}`)

    return NextResponse.json({
      success: true,
      access_token: newTokenData.accessToken,
      refresh_token: newTokenData.refreshToken,
      expires_in: newTokenData.expiresIn,
      token_expiry: newTokenData.tokenExpiry,
      refreshed_at: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[Proactive Refresh] Error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to refresh token proactively",
        success: false,
      },
      { status: 500 },
    )
  }
}

export async function PUT() {
  try {
    console.log("[Batch Refresh] Starting batch token refresh process...")

    // Get all X connections from Firebase
    const connectionsRef = collection(db, "connections")
    const q = query(connectionsRef, where("platform", "==", "x"))

    const querySnapshot = await getDocs(q)
    const refreshResults = []
    let successCount = 0
    let errorCount = 0

    for (const connectionDoc of querySnapshot.docs) {
      const connectionData = connectionDoc.data()
      const userId = connectionData.userId
      const refreshToken = connectionData.refreshToken
      const tokenExpiry = connectionData.tokenExpiry

      if (!refreshToken || !tokenExpiry) {
        console.log(`[Batch Refresh] Skipping user ${userId} - missing refresh token or expiry`)
        continue
      }

      // Check if token needs refresh (within 1 hour of expiry)
      const expiryDate = new Date(tokenExpiry)
      const now = new Date()
      const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntilExpiry > 1) {
        console.log(
          `[Batch Refresh] Skipping user ${userId} - token still valid for ${hoursUntilExpiry.toFixed(1)} hours`,
        )
        continue
      }

      try {
        console.log(
          `[Batch Refresh] Refreshing token for user ${userId} (expires in ${hoursUntilExpiry.toFixed(1)} hours)`,
        )

        // Refresh the token
        const newTokenData = await refreshXToken(refreshToken)

        // Update the connection in Firebase
        await updateDoc(doc(db, "connections", connectionDoc.id), {
          accessToken: newTokenData.accessToken,
          refreshToken: newTokenData.refreshToken,
          tokenExpiry: newTokenData.tokenExpiry,
          lastRefresh: new Date().toISOString(),
          refreshCount: (connectionData.refreshCount || 0) + 1,
        })

        refreshResults.push({
          userId,
          status: "success",
          newExpiry: newTokenData.tokenExpiry,
          refreshedAt: new Date().toISOString(),
        })

        successCount++
        console.log(`[Batch Refresh] Successfully refreshed token for user ${userId}`)
      } catch (error: any) {
        console.error(`[Batch Refresh] Failed to refresh token for user ${userId}:`, error)

        refreshResults.push({
          userId,
          status: "error",
          error: error.message,
          attemptedAt: new Date().toISOString(),
        })

        errorCount++
      }

      // Add small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log(`[Batch Refresh] Completed: ${successCount} successful, ${errorCount} failed`)

    return NextResponse.json({
      success: true,
      summary: {
        total: refreshResults.length,
        successful: successCount,
        failed: errorCount,
      },
      results: refreshResults,
      completedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[Batch Refresh] Batch refresh failed:", error)
    return NextResponse.json(
      {
        error: error.message || "Batch refresh failed",
        success: false,
      },
      { status: 500 },
    )
  }
}
