import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { accessToken, pageId, message, scheduledDate, published, imageUrls } = await request.json();
    interface PData{
      scheduled_publish_time?: string;
      published: boolean;
      message: string;
      caption?: string;
      access_token: string;
      url?: string;
      attached_media?: {  
        media_fbid: string;
      }[];
      media_fbid?: string;
    }
    const time = scheduledDate ? {
      scheduled_publish_time: scheduledDate,
      published: false,
    } : {
      published,
    };
    
    const postData: PData = {
      ...time,
      message,
      access_token: accessToken,
    };

    if (imageUrls && imageUrls.length == 1) {
      postData.url = imageUrls[0];
      postData.caption = message;
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },  
          body: new URLSearchParams(
            Object.entries({
              url: postData.url,
              caption: postData.caption,
              access_token: postData.access_token,
            })
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
          ),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create post');
      }
  
      return NextResponse.json(data);


    }else if(imageUrls && imageUrls.length > 1){
      for(const url of imageUrls){
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },   
          body: new URLSearchParams(
            Object.entries({
              url,
              published: false,
              access_token: accessToken,
            })
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
          ),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create post');
      }

      postData.attached_media?.push({
          media_fbid: data.id,
        });
      }

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: new URLSearchParams(
            Object.entries({
            message: postData.message,
            access_token: postData.access_token,
            attached_media: postData.attached_media?.map((media) => media.media_fbid).join(','),
            published: postData.published.toString(),
            scheduled_publish_time: postData.scheduled_publish_time,
          })
          .filter(([_, value]) => value !== undefined)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
          ),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create post');
      }
      return NextResponse.json(data);



    }else{

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: new URLSearchParams(
            Object.entries({
              message: postData.message,
              access_token: postData.access_token,
              published: postData.published.toString(),
              scheduled_publish_time: postData.scheduled_publish_time,
            })
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
          ),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create post');
      }
  
      return NextResponse.json(data);

    }
  } catch (error: any) {
    console.error('Facebook API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}