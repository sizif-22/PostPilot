"use server";

import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getMultipleUploadUrls(files: { filename: string, contentType: string, keyPrefix?: string }[], collectionId: string) {

    const s3 = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_KEY!,
        },
    });

    const results = [];
    for (const file of files) {
        // Default to collections/ if no prefix provided
        const prefix = file.keyPrefix || `collections/${collectionId}/`;
        // Ensure prefix ends with / if it's a folder, but here we might pass full path prefix?
        // Let's assume keyPrefix is the folder path e.g. "thumbnails/123/"

        const key = `${prefix}${file.filename}`;
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: key,
            ContentType: file.contentType,
        });

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

        results.push({
            filename: file.filename,
            url: signedUrl,
        });
    }

    return results;
}

export async function listCollectionFiles(collectionId: string) {
    const s3 = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_KEY!,
        },
    });

    const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET!,
        Prefix: `collections/${collectionId}/`,
    });

    const response = await s3.send(command);

    if (!response.Contents) {
        return [];
    }

    const files = await Promise.all(response.Contents.map(async (file) => {
        const getCommand = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: file.Key,
        });
        const url = await getSignedUrl(s3, getCommand, { expiresIn: 3600 }); // 1 hour

        const isVideo = file.Key!.match(/\.(mp4|webm|mov|avi)$/i);
        let thumbnailUrl = undefined;

        if (isVideo) {
            const thumbnailKey = `thumbnails/${collectionId}/${file.Key!.split('/').pop()}.jpg`;
            const getThumbnailCommand = new GetObjectCommand({
                Bucket: process.env.R2_BUCKET!,
                Key: thumbnailKey,
            });
            thumbnailUrl = await getSignedUrl(s3, getThumbnailCommand, { expiresIn: 3600 });
        }

        return {
            key: file.Key!,
            name: file.Key!.split('/').pop()!,
            size: file.Size!,
            lastModified: file.LastModified!,
            url: url,
            type: (isVideo ? 'video' : 'image') as 'video' | 'image',
            thumbnailUrl: thumbnailUrl,
        };
    }));

    return files;
}

export async function deleteCollectionFile(key: string) {
    const s3 = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_KEY!,
        },
    });

    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
    });

    await s3.send(command);

    // If it was a legacy video, try to delete the thumbnail too
    if (key.match(/\.(mp4|webm|mov|avi)$/i)) {
        const parts = key.split('/');
        const filename = parts.pop();
        const collectionId = parts[1]; // collections/[id]/filename
        const thumbnailKey = `thumbnails/${collectionId}/${filename}.jpg`;

        const deleteThumbnailCommand = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: thumbnailKey,
        });

        try {
            await s3.send(deleteThumbnailCommand);
        } catch (e) {
            console.log("Failed to delete thumbnail or it didn't exist", e);
        }
    }
}
