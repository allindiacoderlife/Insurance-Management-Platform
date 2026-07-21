import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/app.config.js";
import { prisma } from "../lib/prisma.js";
import { sendOtpEmail } from "../services/email.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "CUSTOMER", phone, address, dob } = req.body;

  // Check duplicate email in User table
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new ApiError(400, "Email address is already registered");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate OTP (valid for 10 minutes)
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Perform user creation (and linked customer if CUSTOMER role)
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        otp,
        otpExpiresAt,
        isEmailVerified: false,
      },
    });

    let customer = null;
    if (role === "CUSTOMER") {
      customer = await tx.customer.create({
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: phone || "Not Provided",
          address: address || "Not Provided",
          dob: dob ? new Date(dob) : new Date("1990-01-01"),
        },
      });
    }

    return { user, customer };
  });

  // Send OTP email
  await sendOtpEmail(
    result.user.email,
    otp,
    "Verify your email OTP - Havenix Insurance ERP"
  );

  res.status(201).json({
    success: true,
    requireOtp: true,
    message: "Account created successfully. An OTP has been sent to your email.",
    data: {
      email: result.user.email,
    },
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      customer: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate OTP for login verification step
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiresAt,
    },
  });

  await sendOtpEmail(
    user.email,
    otp,
    "Login Verification OTP - Havenix Insurance ERP"
  );

  res.status(200).json({
    success: true,
    requireOtp: true,
    message: "Login verification OTP sent to your email.",
    data: {
      email: user.email,
    },
  });
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      customer: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  if (!user.otp || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      otp: null,
      otpExpiresAt: null,
    },
    include: {
      customer: true,
    },
  });

  const token = generateToken(updatedUser.id, updatedUser.role);
  const { password: _pwd, otp: _otp, otpExpiresAt: _exp, ...sanitizedUser } = updatedUser;

  res.status(200).json({
    success: true,
    message: "Verification successful! Welcome to Havenix Insurance ERP.",
    data: {
      user: sanitizedUser,
      token,
    },
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiresAt,
    },
  });

  await sendOtpEmail(
    user.email,
    otp,
    "Your New Verification OTP - Havenix Insurance ERP"
  );

  res.status(200).json({
    success: true,
    message: "A new OTP has been sent to your email",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new ApiError(404, "No account found with this email address");
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiresAt,
    },
  });

  await sendOtpEmail(
    user.email,
    otp,
    "Password Reset OTP - Havenix Insurance ERP"
  );

  res.status(200).json({
    success: true,
    message: "Password reset OTP sent to your email",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  if (!user.otp || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiresAt: null,
    },
  });

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully. You can now log in with your new password.",
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});
