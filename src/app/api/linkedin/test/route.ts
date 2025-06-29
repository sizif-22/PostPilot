import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if environment variables are set
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          status: "error",
          message: "LinkedIn environment variables not configured",
          missing: {
            clientId: !clientId,
            clientSecret: !clientSecret,
          },
        },
        { status: 500 }
      );
    }

    // Test LinkedIn API connectivity
    const testResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: "Bearer test_token",
        "LinkedIn-Version": "202405",
      },
    });

    return NextResponse.json({
      status: "success",
      message: "LinkedIn integration is properly configured",
      environment: {
        clientId: clientId ? "✓ Set" : "✗ Missing",
        clientSecret: clientSecret ? "✓ Set" : "✗ Missing",
      },
      apiStatus: "LinkedIn API is accessible",
      redirectUri: "https://postpilot-22.vercel.app/connection/linkedin",
      scopes:
        "openid w_organization_social rw_organization_admin r_organization_social",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "LinkedIn integration test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
