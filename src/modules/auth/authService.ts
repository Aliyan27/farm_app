import { randomBytes } from "crypto";
import prisma from "../../utils/Prisma";
import { signinSchema, signupSchema } from "./auth.validation";
import bcrypt from "bcrypt";
import { signToken } from "../../utils/jwt";
import { token } from "morgan";
import { sendOTP } from "../inventory/emailService";

export const signupService = async (data: typeof signupSchema._output) => {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: data.role,
      password: hashedPassword,
    },
  });

  return {
    statusCode: 201,
    message: "success",
    data: null,
  };
};

export const signinService = async (data: typeof signinSchema._output) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    return {
      statusCode: 401,
      message: "Invalid credentials",
      data: null,
    };
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    return {
      statusCode: 401,
      message: "Invalid credentials",
      data: null,
    };
  }

  const { password, otp, otpExpires, ...safeUser } = user;
  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    statusCode: 200,
    message: "success",
    data: { token, user: safeUser },
  };
};

export const forgotPasswordService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return {
      statusCode: 404,
      message: "No account found with this email",
      data: null,
    };
  }

  if (!user.isEmailVerified) {
    return {
      statusCode: 403,
      message: "Email is not verified. Please verify your email first.",
      data: null,
    };
  }

  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpires,
    },
  });

  try {
    await sendOTP(user.email, otp);
  } catch (err: any) {
    console.error("Reset email failed:", err);
    return {
      statusCode: 500,
      message: "Failed to send reset email. Please try again later.",
      data: null,
    };
  }

  return {
    statusCode: 200,
    message: "success",
    data: null,
  };
};

export const verifyOTPService = async (email: string, otp: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
      otp: otp,
      otpExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return {
      statusCode: 400,
      message: "Invalid or expired reset token",
      data: null,
    };
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    statusCode: 200,
    message: "success",
    data: { token },
  };
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
