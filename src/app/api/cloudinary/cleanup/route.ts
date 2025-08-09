// pages/api/cloudinary/cleanup.ts or app/api/cloudinary/cleanup/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Helper function to generate Cloudinary signature
const generateSignature = (params: Record<string, any>, apiSecret: string): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({ error: 'Public ID is required' });
  }

  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ error: 'Cloudinary configuration missing' });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      public_id: publicId,
      timestamp: timestamp,
      api_key: CLOUDINARY_API_KEY,
    };

    const signature = generateSignature(params, CLOUDINARY_API_SECRET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          signature,
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({ success: true, result });
    } else {
      res.status(400).json({ error: 'Failed to delete from Cloudinary', result });
    }
  } catch (error) {
    console.error('Cloudinary cleanup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// For App Router (app/api/cloudinary/cleanup/route.ts)
export async function POST(request: Request) {
  const { publicId } = await request.json();

  if (!publicId) {
    return Response.json({ error: 'Public ID is required' }, { status: 400 });
  }

  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    return Response.json({ error: 'Cloudinary configuration missing' }, { status: 500 });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      public_id: publicId,
      timestamp: timestamp,
      api_key: CLOUDINARY_API_KEY,
    };

    const signature = generateSignature(params, CLOUDINARY_API_SECRET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          signature,
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      return Response.json({ success: true, result });
    } else {
      return Response.json({ error: 'Failed to delete from Cloudinary', result }, { status: 400 });
    }
  } catch (error) {
    console.error('Cloudinary cleanup error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}