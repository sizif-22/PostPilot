import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { pageId, accessToken } = await request.json();

  if (!pageId || !accessToken) {
    return NextResponse.json({ error: 'Missing pageId or accessToken' }, { status: 400 });
  }

  try {
    // Replace with your actual API fetching logic
    const apiResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/insights?metric=page_fans,page_post_engagement,page_impressions,page_actions_post_reactions_like_total&period=day&since=2024-05-01&until=2024-05-30&access_token=${accessToken}`
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('Facebook API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch data from Facebook' }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();

    // Process and format the data as needed for the dashboard
    const formattedData = {
      // This is just an example, you will need to format the data according to your needs
      totalReach: data.data.find((m: any) => m.name === 'page_impressions')?.values[0]?.value || 0,
      totalImpressions: data.data.find((m: any) => m.name === 'page_impressions')?.values.reduce((acc: any, curr: any) => acc + curr.value, 0) || 0,
      totalEngagementRate: 5.5, // Calculate this based on your data
      totalLikes: data.data.find((m: any) => m.name === 'page_actions_post_reactions_like_total')?.values.reduce((acc: any, curr: any) => acc + curr.value, 0) || 0,
      // ... and so on for the rest of the data
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching Facebook data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
