import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmailMessage = async ({
  to,
  subject,
  message,
  html,
  verificationCode,
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const styledHtml =
      html ||
      `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">🔐 Email Verification</h2>
        <p style="font-size: 16px; color: #555;">Thank you for signing up! Please use the verification code below to verify your email address:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #007BFF; letter-spacing: 4px; padding: 10px 20px; border: 2px dashed #007BFF; border-radius: 8px; background: #fff;">
            ${verificationCode || "######"}
          </span>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center;">This code will expire in 1 hour.</p>
        <p style="font-size: 14px; color: #aaa; text-align: center;">If you did not sign up, please ignore this email.</p>
      </div>
    `;

    const plainText =
      message ||
      `Your verification code is: ${
        verificationCode || "######"
      }. It will expire in 1 hour.`;

    const mailOptions = {
      from: process.env.GMAIL_FROM || process.env.GMAIL_USERNAME,
      to,
      subject,
      text: plainText,
      html: styledHtml,
    };

    const res = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", res.messageId);
  } catch (err) {
    console.error("❌ Email sending error:", err);
    throw new Error("There was an error sending the email. Try again later!");
  }
};
