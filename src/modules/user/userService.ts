import z from "zod";
import prisma from "../../utils/Prisma";
import { ServiceResponse } from "../expenses/expenseService";
import {
  changeEmailSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "./user.validation";
import bcrypt from "bcrypt";
import { sendOTP } from "../inventory/emailService";

export const changePasswordService = async (
  data: typeof changePasswordSchema._output,
  userId: number,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      statusCode: 404,
      message: "User not found",
      data: null,
    };
  }

  let oldPasswordMatches = true;
  if (data.oldPassword) {
    oldPasswordMatches = await bcrypt.compare(data.oldPassword, user.password);
  }

  if (!oldPasswordMatches) {
    return {
      statusCode: 401,
      message: "Current password is incorrect",
      data: null,
    };
  }

  const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return {
    statusCode: 200,
    message: "success",
    data: null,
  };
};

export const updateProfileService = async (
  data: z.infer<typeof updateProfileSchema>,
  userId: number,
): Promise<ServiceResponse> => {
  try {
    // Optional: check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        statusCode: 404,
        message: "User not found",
        data: null,
      };
    }

    // Only update allowed fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ? data.name.trim() : undefined,
        email: data.email,
        isEmailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    return {
      statusCode: 200,
      message: "success",
      data: updatedUser,
    };
  } catch (err: any) {
    console.error("[updateProfileService] Error:", err);

    if (err.code === "P2025") {
      return {
        statusCode: 404,
        message: "User not found",
        data: null,
      };
    }

    return {
      statusCode: 500,
      message: "Failed to update profile",
      data: null,
    };
  }
};

export const sendVerificationEmailService = async (
  email: string,
): Promise<ServiceResponse<null>> => {
  try {
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        otp,
        otpExpires,
      },
    });

    await sendOTP(email, otp);

    return {
      statusCode: 200,
      message: "success",
      data: null,
    };
  } catch (error: any) {
    console.error("sendVerificationEmail error:", error);
    return {
      statusCode: 500,
      message: error.message || "Failed to send verification email",
      data: null,
    };
  }
};

export const verifyEmailService = async (
  email: string,
  otp: string,
): Promise<ServiceResponse<null>> => {
  try {
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
        message: "Invalid or expired verification token",
        data: null,
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        otp: null,
        otpExpires: null,
      },
    });

    return {
      statusCode: 200,
      message: "success",
      data: null,
    };
  } catch (error: any) {
    console.error("verifyEmail error:", error);
    return { statusCode: 500, message: "Verification failed", data: null };
  }
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
