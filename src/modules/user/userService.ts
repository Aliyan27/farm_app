import prisma from "../../utils/Prisma";
import { changePasswordSchema } from "./user.validation";
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
