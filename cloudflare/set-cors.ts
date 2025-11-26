import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
    },
});

async function setCors() {
    console.log("Setting CORS for bucket:", process.env.R2_BUCKET);

    const command = new PutBucketCorsCommand({
        Bucket: process.env.R2_BUCKET!,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ["*"],
                    AllowedMethods: ["PUT", "GET", "HEAD", "DELETE", "POST"],
                    AllowedOrigins: ["*"], // For development, allow all. In production, restrict this.
                    ExposeHeaders: ["ETag"],
                    MaxAgeSeconds: 3000,
                },
            ],
        },
    });

    try {
        await s3.send(command);
        console.log("Successfully set CORS configuration.");
    } catch (err) {
        console.error("Error setting CORS:", err);
    }
}

setCors();
