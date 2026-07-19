import nodemailer from "nodemailer";
import { config } from "../config/app.config.js";

const createTransporter = () => {
  if (config.smtp.user && config.smtp.pass) {
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return null;
};

export const sendOtpEmail = async (toEmail, otp, subject = "Your OTP Verification Code") => {
  const transporter = createTransporter();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #1e293b; text-align: center;">Insurance Management Platform</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 16px; color: #334155;">Hello,</p>
      <p style="font-size: 16px; color: #334155;">Your One-Time Password (OTP) for account verification / password reset is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 6px; border: 1px dashed #3b82f6;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #64748b;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Insurance Management Platform &copy; 2026. All rights reserved.</p>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: config.smtp.from,
      to: toEmail,
      subject,
      html: htmlContent,
    });
    console.log(`📧 OTP Email sent successfully to ${toEmail}`);
  } else {
    console.log(`\n==================================================`);
    console.log(`📧 [DEV MODE] Email Transporter not configured.`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`🔑 OTP CODE: ${otp}`);
    console.log(`==================================================\n`);
  }
};
