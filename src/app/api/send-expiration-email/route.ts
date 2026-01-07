import { NextRequest, NextResponse } from "next/server";
import { createTransport } from "nodemailer";

const configOptions = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Boolean(Number(process.env.SMTP_SECURE)),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const transporter = createTransport(configOptions);

export async function POST(req: NextRequest) {
  const { userEmail, platformName } = await req.json();

  const mailOptions = {
    from: '"PostPilot" <postpilot@webbingstone.org>',
    to: userEmail,
    subject: `PostPilot | ${platformName} token has expired`,
    text: `Your access token for ${platformName} has expired. Please log in to PostPilot and reconnect your account.`,
    html: `<b>Your access token for ${platformName} has expired. Please log in to PostPilot and reconnect your account.</b>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending expiration email:", error);
    return NextResponse.json({ error: "Error sending email" }, { status: 500 });
  }
}
