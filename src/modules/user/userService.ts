import z from "zod";
import prisma from "../../utils/Prisma";
import { ServiceResponse } from "../expenses/expenseService";
import { changePasswordSchema, updateProfileSchema } from "./user.validation";
import bcrypt from "bcrypt";

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

  const isOldPasswordValid = await bcrypt.compare(
    data.oldPassword,
    user.password,
  );

  if (!isOldPasswordValid) {
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
    message: "Password changed successfully",
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
        // Add more fields when you extend the schema
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
      message: "Profile updated successfully",
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
