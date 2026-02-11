import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./env";

export const signToken = (payload: object) => {
  if (!JWT_SECRET) throw new Error("Invalid jwt key");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
  if (!JWT_SECRET) throw new Error("Invalid jwt key");
  return jwt.verify(token, JWT_SECRET);
};
