// Fixed backend route that schedules posts via AWS EventBridge
import { NextResponse } from "next/server";

interface SchedulePostRequest {
  scheduledDate: number; // Unix timestamp
  channelId: string;
  postId: string;
}

// Standardized payload format for Lambda
interface LambdaPayload {
  channelId: string;
  postId: string;
  scheduledAt: string;
}

export async function POST(request: Request) {
  try {
    const post: SchedulePostRequest = await request.json();

    // Validate required fields
    if (!post.scheduledDate || !post.channelId || !post.postId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: scheduledDate, channelId, and postId are required",
        },
        { status: 400 }
      );
    }

    // Validate scheduledDate is a valid timestamp
    if (typeof post.scheduledDate !== "number" || post.scheduledDate <= 0) {
      return NextResponse.json(
        { error: "Invalid scheduledDate: must be a valid Unix timestamp" },
        { status: 400 }
      );
    }

    // Check if the scheduled date is in the future
    const now = Math.floor(Date.now() / 1000);
    if (post.scheduledDate <= now) {
      return NextResponse.json(
        { error: "Scheduled date must be in the future" },
        { status: 400 }
      );
    }

    // Convert Unix timestamp to ISO string for the scheduler
    const scheduleTime = new Date(post.scheduledDate * 1000).toISOString();

    console.log(`Scheduling post ${post.postId} for ${scheduleTime}`);

    // Prepare standardized payload for the Lambda function
    const lambdaPayload: LambdaPayload = {
      channelId: post.channelId,
      postId: post.postId,
      scheduledAt: scheduleTime,
    };

    const schedulerUrl =
      process.env.SCHEDULER_URL ||
      "https://uc7rd5x13i.execute-api.eu-north-1.amazonaws.com/prod/schedule";

    console.log("Scheduler URL:", schedulerUrl);

    // Determine payload format based on scheduler type
    let schedulerPayload: any;

    if (
      schedulerUrl.includes("scheduler") ||
      process.env.USE_EVENTBRIDGE_SCHEDULER === "true"
    ) {
      // EventBridge Scheduler format
      const scheduleName = `scheduled-post-${post.postId}-${Date.now()}`;

      // Convert ISO time to EventBridge 'at' expression format
      const scheduleExpression = `at(${scheduleTime
        .replace(/[:\-]/g, "")
        .replace("T", "T")
        .slice(0, 15)})`;

      schedulerPayload = {
        Name: scheduleName,
        ScheduleExpression: scheduleExpression,
        ScheduleExpressionTimezone: "UTC",
        Target: {
          Arn: process.env.LAMBDA_FUNCTION_ARN,
          Input: JSON.stringify(lambdaPayload),
          RoleArn: process.env.EVENTBRIDGE_ROLE_ARN,
        },
        FlexibleTimeWindow: {
          Mode: "OFF",
        },
      };
    } else if (process.env.USE_WRAPPED_PAYLOAD === "true") {
      // Custom API Gateway wrapper format
      schedulerPayload = {
        action: "schedule",
        schedule: {
          time: scheduleTime,
          payload: lambdaPayload,
        },
      };
    } else {
      // Direct Lambda payload format (most common for API Gateway)
      schedulerPayload = lambdaPayload;
    }

    console.log(
      "Calling scheduler with payload:",
      JSON.stringify(schedulerPayload, null, 2)
    );

    const schedulerResponse = await fetch(schedulerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add API key if you have one
        ...(process.env.AWS_API_KEY && {
          "x-api-key": process.env.AWS_API_KEY,
        }),
        // Add Authorization header if needed
        ...(process.env.AWS_AUTHORIZATION_HEADER && {
          Authorization: process.env.AWS_AUTHORIZATION_HEADER,
        }),
      },
      body: JSON.stringify(schedulerPayload),
    });

    console.log("Scheduler response status:", schedulerResponse.status);
    console.log(
      "Scheduler response headers:",
      Object.fromEntries(schedulerResponse.headers.entries())
    );

    if (!schedulerResponse.ok) {
      let errorText;
      let errorJson;

      try {
        errorText = await schedulerResponse.text();
        // Try to parse as JSON for more detailed error info
        try {
          errorJson = JSON.parse(errorText);
        } catch (e) {
          // errorText is not JSON, keep as string
        }
      } catch (e) {
        errorText = "Unable to read error response";
      }

      console.error("Scheduler service error details:", {
        status: schedulerResponse.status,
        statusText: schedulerResponse.statusText,
        headers: Object.fromEntries(schedulerResponse.headers.entries()),
        body: errorText,
        parsedError: errorJson,
        sentPayload: schedulerPayload,
      });

      // Return a more informative error to the client
      return NextResponse.json(
        {
          error: "Scheduler service error",
          details: {
            status: schedulerResponse.status,
            statusText: schedulerResponse.statusText,
            message: errorJson?.message || errorText,
            errorCode: errorJson?.errorCode || errorJson?.code,
            requestId: schedulerResponse.headers.get("apigw-requestid"),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 502 } // Bad Gateway since the upstream service failed
      );
    }

    let schedulerResult;
    try {
      schedulerResult = await schedulerResponse.json();
    } catch (e) {
      schedulerResult = { message: "Scheduled successfully" };
    }

    console.log("Post scheduled successfully:", schedulerResult);

    // Generate a unique rule name for tracking
    const ruleName = `scheduled-post-${post.postId}-${Date.now()}`;

    return NextResponse.json(
      {
        success: true,
        message: "Post scheduled successfully",
        scheduledAt: scheduleTime,
        ruleName: ruleName,
        channelId: post.channelId,
        postId: post.postId,
        schedulerResponse: schedulerResult,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Scheduling error:", error);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        error: error.message || "Failed to schedule post",
        timestamp: new Date().toISOString(),
        type: error.constructor.name,
      },
      { status: 500 }
    );
  }
}
