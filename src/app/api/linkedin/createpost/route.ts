import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { postId, channelId } = await request.json();

    if (!postId || !channelId) {
      return NextResponse.json(
        { error: "Missing postId or channelId" },
        { status: 400 }
      );
    }

    // Get the post and channel data from your database
    // This is a placeholder - you'll need to implement the actual database fetch
    const post = {
      id: postId,
      message: "Sample post content",
      platforms: ["linkedin"],
      // Add other post fields as needed
    };

    const channel = {
      id: channelId,
      socialMedia: {
        linkedin: {
          accessToken: "your_access_token",
          urn: "your_organization_urn",
          organizationId: "your_organization_id",
        },
      },
    };

    // Check if LinkedIn is selected for this post
    if (!post.platforms.includes("linkedin")) {
      return NextResponse.json(
        { error: "LinkedIn not selected for this post" },
        { status: 400 }
      );
    }

    // Check if LinkedIn is connected
    if (!channel.socialMedia?.linkedin) {
      return NextResponse.json(
        { error: "LinkedIn not connected" },
        { status: 400 }
      );
    }

    const { accessToken, urn } = channel.socialMedia.linkedin;

    // Prepare the LinkedIn post data
    const linkedInPostData = {
      author: urn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: post.message,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    // Post to LinkedIn
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202405",
      },
      body: JSON.stringify(linkedInPostData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("LinkedIn API error:", errorData);
      throw new Error(
        `LinkedIn API error: ${errorData.message || response.statusText}`
      );
    }

    const result = await response.json();

    // Update the post status in your database
    // This is a placeholder - you'll need to implement the actual database update
    console.log("LinkedIn post created:", result);

    return NextResponse.json({
      success: true,
      linkedinPostId: result.id,
      message: "Post published to LinkedIn successfully",
    });
  } catch (error: unknown) {
    console.error("Error posting to LinkedIn:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
