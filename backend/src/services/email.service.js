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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background-color: #0b281a; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h2 style="color: #e2f5cf; margin: 0; font-size: 22px;">Havenix Insurance ERP</h2>
      </div>
      <p style="font-size: 16px; color: #334155;">Hello,</p>
      <p style="font-size: 16px; color: #334155;">Your One-Time Password (OTP) for account verification / password reset is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0b281a; background: #e2f5cf; padding: 12px 24px; border-radius: 8px; border: 2px solid #0b281a;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #64748b;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Havenix Insurance Platform &copy; 2026. All rights reserved.</p>
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

/**
 * Send Welcome & Login Credentials Email to newly created Agent Account
 */
export const sendAgentCredentialsEmail = async (agentEmail, agentName, tempPassword, agentCode) => {
  const transporter = createTransporter();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #0b281a; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #e2f5cf; margin: 0; font-size: 24px;">Havenix Insurance ERP</h2>
        <p style="color: #ffffff; font-size: 13px; margin: 4px 0 0 0;">Agent Portal Onboarding</p>
      </div>

      <h3 style="color: #0b281a; margin-top: 0;">Welcome to Havenix, ${agentName}! 🎉</h3>
      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        Your official Agent Account has been successfully provisioned by the Administrator. You now have full access to manage customer insurance policies, process claims, and issue quotes.
      </p>

      <div style="background-color: #f7f8f4; border: 1px solid #e2f5cf; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 12px 0; color: #0b281a; font-size: 14px;">🔑 Account Credentials</h4>
        <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Agent ID Code:</strong> <span style="font-family: monospace; font-size: 14px; color: #0b281a; font-weight: bold;">${agentCode}</span></p>
        <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Login Email:</strong> ${agentEmail}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 14px; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        Please login to the Havenix Agent Portal and update your password under <strong>My Profile &rarr; Security</strong>.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="http://localhost:5173/login" style="display: inline-block; background-color: #0b281a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; font-size: 14px;">
          Login to Agent Portal &rarr;
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 28px;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Havenix Insurance ERP &copy; 2026. Secure & Confidential.</p>
    </div>
  `;

  const subject = "🎉 Welcome to Havenix - Your Agent Account Credentials";

  if (transporter) {
    await transporter.sendMail({
      from: config.smtp.from,
      to: agentEmail,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Agent Welcome & Credentials Email sent successfully to ${agentEmail}`);
  } else {
    console.log(`\n==================================================`);
    console.log(`📧 [DEV MODE] Agent Credentials Email Transporter`);
    console.log(`To Agent: ${agentEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Agent Name: ${agentName} | Code: ${agentCode}`);
    console.log(`🔑 Temp Password: ${tempPassword}`);
    console.log(`==================================================\n`);
  }
};

/**
 * Send Alert Email to Admin confirming Agent Account Creation
 */
export const sendAdminAgentCreatedAlertEmail = async (adminEmail, agentName, agentEmail, agentCode) => {
  const transporter = createTransporter();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h3 style="color: #0b281a;">System Notification: New Agent Created</h3>
      <p style="font-size: 14px; color: #334155;">A new agent account has been created and credentials have been dispatched:</p>
      <ul style="font-size: 13px; color: #475569;">
        <li><strong>Agent Name:</strong> ${agentName}</li>
        <li><strong>Email:</strong> ${agentEmail}</li>
        <li><strong>Agent Code:</strong> ${agentCode}</li>
        <li><strong>Status:</strong> Active & Verified</li>
      </ul>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: config.smtp.from,
      to: adminEmail,
      subject: `[Admin Alert] New Agent Account Created - ${agentName}`,
      html: htmlContent,
    });
  }
};
