import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";

// Initialize SES client
export const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Email sending options interface
export interface SendEmailOptions {
    to: string | string[];
    from: string;
    subject: string;
    html: string;
    text?: string;
}

// Result interface
export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: unknown;
}

/**
 * Send an email using AWS SES
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, from, subject, html, text } = options;

    const toAddresses = Array.isArray(to) ? to : [to];

    const params: SendEmailCommandInput = {
        Source: from,
        Destination: {
            ToAddresses: toAddresses,
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: "UTF-8",
            },
            Body: {
                Html: {
                    Data: html,
                    Charset: "UTF-8",
                },
                ...(text && {
                    Text: {
                        Data: text,
                        Charset: "UTF-8",
                    },
                }),
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);

        return {
            success: true,
            messageId: response.MessageId,
        };
    } catch (error) {
        console.error("AWS SES Error:", error);
        return {
            success: false,
            error,
        };
    }
}
