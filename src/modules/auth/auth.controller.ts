import { Request, Response } from "express";
import { signupSchema, signinSchema } from "./auth.validation";
import { signupService, signinService } from "./authService";
import { getCustomizedError } from "../../utils/UtilityFunctions";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Public authentication endpoints (signup and signin)
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Creates a new user account. Email must be unique. Password is hashed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Malik Ahmed"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "malik@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "SecurePass123"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "user"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Validation error (e.g. invalid email, short password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already exists"
 */
export const signupController = async (req: Request, res: Response) => {
  try {
    const data = signupSchema.parse(req.body);

    const result = await signupService(data);

    if (result.data) {
      return res.status(result.statusCode).json({
        message: result.message,
        user: result.data,
      });
    }

    return res.status(result.statusCode).json({
      message: result.message,
    });
  } catch (error: any) {
    return getCustomizedError(error, res);
  }
};

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     description: Authenticates user and returns JWT token for subsequent requests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "malik@example.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       400:
 *         description: Validation error (e.g. invalid email format)
 */
export const signinController = async (req: Request, res: Response) => {
  try {
    const data = signinSchema.parse(req.body);

    const result = await signinService(data);

    if (result.data) {
      return res.status(result.statusCode).json({
        message: result.message,
        ...result.data,
      });
    }

    return res.status(result.statusCode).json({
      message: result.message,
    });
  } catch (error: any) {
    return getCustomizedError(error, res);
  }
};
