import { sendEmail } from "@/smtp/config";

export const sendPostEditNotification = async (ownerEmail: string, channelId: string, emailBody: string) => {
    try {
        await sendEmail({
            from: '"PostPilot" <notification@postpilot.webbingstone.org>',
            to: ownerEmail,
            subject: `Post Edited in ${channelId}`,
            html: emailBody,
        });
        return { message: "success" };
    } catch (error) {
        return { message: "error" };
    }
};
