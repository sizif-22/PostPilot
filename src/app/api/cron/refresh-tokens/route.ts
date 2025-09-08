import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[Cron] Starting automated token refresh...")

    // Call the batch refresh endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_REDIRECT_URI}/api/x/proactive-refresh`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Batch refresh failed")
    }

    console.log("[Cron] Automated refresh completed:", result)

    return NextResponse.json({
      success: true,
      message: "Automated token refresh completed",
      ...result,
    })
  } catch (error: any) {
    console.error("[Cron] Automated refresh failed:", error)
    return NextResponse.json({ error: error.message || "Cron job failed" }, { status: 500 })
  }
}
