export async function GET() {
  try {
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    const PAGE_ID = process.env.PAGE_ID;

    // Changed endpoint from 'promotable_posts' to 'scheduled_posts'
    const url = `https://graph.facebook.com/v18.0/${PAGE_ID}/scheduled_posts?access_token=${ACCESS_TOKEN}&fields=message,scheduled_publish_time,created_time,id`;
    console.log("ACCESS TOKEN:", ACCESS_TOKEN);
    console.log("PAGE_ID:", PAGE_ID);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("Facebook API error response:", data);
      throw new Error(
        `Facebook API error: ${data.error?.message || response.statusText}`
      );
    }

    return new Response(JSON.stringify({ posts: data.data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}