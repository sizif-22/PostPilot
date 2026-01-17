import { sendEmail } from "@/smtp/config";

export const sendExpirationEmail = async (userEmail: string, platformName: string) => {
    try {
        await sendEmail({
            from: '"PostPilot" <notification@postpilot.webbingstone.org>',
            to: userEmail,
            subject: `PostPilot | ${platformName} token has expired`,
            text: `Your access token for ${platformName} has expired. Please log in to PostPilot and reconnect your account.`,
            html: `<b>Your access token for ${platformName} has expired. Please log in to PostPilot and reconnect your account.</b>`,
        });
        return { message: "Email sent successfully" };
    } catch (error) {
        console.error("Error sending expiration email:", error);
        return { message: "Error sending expiration email" };
    }
};