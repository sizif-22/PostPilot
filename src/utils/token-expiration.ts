import { Channel } from "@/interfaces/Channel";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { transporter } from "./smtp.config";
import { getDoc } from "firebase/firestore";
import { User } from "@/interfaces/User";

const sendExpirationEmail = async (userEmail: string, platformName: string) => {
  const mailOptions = {
    from: '"PostPilot" <postpilot@webbingstone.org>',
    to: userEmail,
    subject: `PostPilot | ${platformName} token has expired`,
    text: `Your access token for ${platformName} has expired. Please log in to PostPilot and reconnect your account.`,
    html: `<b>Your access token for ${platformName} has expired. Please log in to PostPilot and reconnect your account.</b>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Expiration email sent successfully.");
  } catch (error) {
    console.error("Error sending expiration email:", error);
  }
};

export const formatRemainingTime = (remainingTime: number) => {
  const seconds = Math.floor(remainingTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day(s) remaining`;
  }
  if (hours > 0) {
    return `${hours} hour(s) remaining`;
  }
  if (minutes > 0) {
    return `${minutes} minute(s) remaining`;
  }
  return `${seconds} second(s) remaining`;
};

export const checkTokenExpiration = async (channel: Channel) => {
  const now = new Date().getTime();
  const owner = channel.TeamMembers.find((member) => member.role === "Owner");
  if (!owner) {
    return channel;
  }
  const userDoc = await getDoc(doc(db, "Users", owner.email));
  const user = userDoc.data() as User;

  const socialMedia = channel.socialMedia || {};
  const updatedSocialMedia = { ...socialMedia };
  let hasChanges = false;

  for (const platformName in socialMedia) {
    const platform = socialMedia[platformName as keyof typeof socialMedia];
    if (
      platform &&
      typeof platform === "object" &&
      "tokenExpiry" in platform &&
      platform.tokenExpiry
    ) {
      const tokenExpiry = new Date(platform.tokenExpiry).getTime();
      if (tokenExpiry < now) {
        await sendExpirationEmail(user.email, platformName);
        delete updatedSocialMedia[
          platformName as keyof typeof updatedSocialMedia
        ];
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    await updateDoc(doc(db, "Channels", channel.id), {
      socialMedia: updatedSocialMedia,
    });
  }

  return {
    ...channel,
    socialMedia: updatedSocialMedia,
  };
};
