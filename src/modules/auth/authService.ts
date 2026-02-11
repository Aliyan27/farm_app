import { Response } from "express";
import prisma from "../../utils/Prisma";
import { signinSchema, signupSchema } from "./auth.validation";
import bcrypt from "bcrypt";
import { signToken } from "../../utils/jwt";

export const signupService = async (data: typeof signupSchema._output) => {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
    },
  });

  const { password, ...safeUser } = user;

  return {
    statusCode: 201,
    message: "User created successfully",
    data: safeUser,
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

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    statusCode: 200,
    message: "Login successful",
    data: { token },
  };
};
