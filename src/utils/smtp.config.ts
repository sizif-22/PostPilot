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

export const transporter = createTransport(configOptions);

// (async () => {
//   const info = await transporter.sendMail({
//     from: '"PostPilot" <postpilot@webbingstone.org>',
//     to: "0453686408s@gmail.com",
//     subject: "Hello ✔",
//     text: "Hello world?",
//     html: "<b>Hello world?</b>",
//   });

//   console.log("Message sent:", info.messageId);
// })();

