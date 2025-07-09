
import { NextResponse } from "next/server";

interface XOrganization {
  id: string;
  name: string;
  urn: string;
}

interface XResponse {
  access_token: string;
  organizations: XOrganization[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    // Mocking the response for X
    const accessToken = "mock_x_access_token";
    const organizations: XOrganization[] = [
      { id: "123", name: "X Company", urn: "urn:x:organization:123" },
    ];

    const response: XResponse = {
      access_token: accessToken,
      organizations: organizations,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in X connect:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
