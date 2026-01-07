import { NextRequest, NextResponse } from "next/server";
import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Boolean(Number(process.env.SMTP_SECURE)),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  const {
    sender,
    receiver,
    channelId,
  }: { sender: string; receiver: string; channelId: string } = await req.json();
  try {
    if (!sender || !receiver || !channelId) throw new Error();
    const info = await transporter.sendMail({
     from: '"PostPilot" <postpilot@webbingstone.org>',
     to: receiver,
     subject: `${sender} invited you to join the Collection: "${channelId}" on PostPilot`,
     text: `
   Hi there!
   
   ${sender} has invited you to join their collection "${channelId}" on PostPilot.
   
   PostPilot makes it easy to stay connected with your team and share updates in real-time.
   
   Join the collection: https://postpilot.webbingstone.org/
   
   If you have any questions, feel free to reach out to us.
   
   Best regards,
   The PostPilot Team
     `.trim(),
     html: `
       <!DOCTYPE html>
       <html lang="en">
       <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>PostPilot Invitation</title>
       </head>
       <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc; color: #334155;">
         <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
           
           <!-- Header -->
           <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
             <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.025em;">
               PostPilot
             </h1>
             <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">
               You're invited to join a group
             </p>
           </div>
   
           <!-- Content -->
           <div style="padding: 40px 24px;">
             <div style="text-align: center; margin-bottom: 32px;">
               <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                   <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                 </svg>
               </div>
             </div>
   
             <h2 style="text-align: center; font-size: 24px; font-weight: bold; color: #1e293b; margin: 0 0 16px 0;">
               You've been invited!
             </h2>
             
             <p style="text-align: center; font-size: 16px; color: #64748b; line-height: 1.6; margin: 0 0 24px 0;">
               <strong style="color: #1e293b;">${sender}</strong> has invited you to join their collection 
               <strong style="color: #667eea;">"${channelId}"</strong> on PostPilot.
             </p>
   
             <p style="text-align: center; font-size: 16px; color: #64748b; line-height: 1.6; margin: 0 0 32px 0;">
               PostPilot makes it easy to stay connected with your team and share updates in real-time.
             </p>
   
             <!-- CTA Button -->
             <div style="text-align: center; margin: 32px 0;">
               <a href="https://postpilot.webbingstone.org/" 
                  style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                 Join Collection
               </a>
             </div>
   
             <!-- Alternative Link -->
             <p style="text-align: center; font-size: 14px; color: #94a3b8; margin: 24px 0 0 0;">
               Can't click the button? Copy and paste this link into your browser:<br>
               <a href="https://postpilot.webbingstone.org/" style="color: #667eea; word-break: break-all;">
                 https://postpilot.webbingstone.org/
               </a>
             </p>
           </div>
   
           <!-- Footer -->
           <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
             <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
               Need help? Contact us at 
               <a href="mailto:postpilot@webbingstone.org" style="color: #667eea; text-decoration: none;">
                 postpilot@webbingstone.org
               </a>
             </p>
             <p style="margin: 0; font-size: 12px; color: #94a3b8;">
               © 2025 PostPilot. All rights reserved.
             </p>
           </div>
           
         </div>
       </body>
       </html>
     `,
   });
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed", error }, { status: 401 });
  }
}
