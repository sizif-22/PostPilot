import { NextResponse } from "next/server"
import { db } from "@/firebase/config"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET() {
  try {
    const connectionsRef = collection(db, "connections")
    const q = query(connectionsRef, where("platform", "==", "x"))

    const querySnapshot = await getDocs(q)
    const tokenHealth = []

    for (const connectionDoc of querySnapshot.docs) {
      const connectionData = connectionDoc.data()
      const tokenExpiry = new Date(connectionData.tokenExpiry)
      const now = new Date()
      const timeUntilExpiry = tokenExpiry.getTime() - now.getTime()

      // Calculate health status
      const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60)
      let status = "healthy"

      if (hoursUntilExpiry <= 0) {
        status = "expired"
      } else if (hoursUntilExpiry <= 0.5) {
        status = "critical"
      } else if (hoursUntilExpiry <= 1) {
        status = "warning"
      }

      tokenHealth.push({
        userId: connectionData.userId,
        username: connectionData.username || "Unknown",
        tokenExpiry: connectionData.tokenExpiry,
        hoursUntilExpiry: Math.max(0, hoursUntilExpiry),
        status,
        lastRefresh: connectionData.lastRefresh || "Never",
        refreshCount: connectionData.refreshCount || 0,
      })
    }

    // Sort by expiry time (most urgent first)
    tokenHealth.sort((a, b) => a.hoursUntilExpiry - b.hoursUntilExpiry)

    const summary = {
      total: tokenHealth.length,
      expired: tokenHealth.filter((t) => t.status === "expired").length,
      critical: tokenHealth.filter((t) => t.status === "critical").length,
      warning: tokenHealth.filter((t) => t.status === "warning").length,
      healthy: tokenHealth.filter((t) => t.status === "healthy").length,
    }

    return NextResponse.json({
      summary,
      tokens: tokenHealth,
    })
  } catch (error: any) {
    console.error("[Token Health] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to check token health" }, { status: 500 })
  }
}
