// src/app/api/createPost/route.js
export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { message, scheduled_publish_time, published,accessToken ,pageId } = body;

    // Base URL and params
    const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    const params = {
      access_token: accessToken,
      message,
    };

    // Handle scheduling logic
    if (scheduled_publish_time && !published) {
      params.published = false;
      // Ensure scheduled_publish_time is a number
      params.scheduled_publish_time = Math.floor(
        Number(scheduled_publish_time)
      );
    }

    // Make the API request to create the post
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Facebook API error response:", data);
      throw new Error(
        `Facebook API error: ${data.error?.message || response.statusText}`
      );
    }

    return new Response(JSON.stringify({ success: true, post: data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create post",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
