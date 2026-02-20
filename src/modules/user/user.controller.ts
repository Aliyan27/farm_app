import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { changePasswordSchema, updateProfileSchema } from "./user.validation";
import { changePasswordService, updateProfileService } from "./userService";
import { getCustomizedError } from "../../utils/UtilityFunctions";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User account management (change password, profile, etc.)
 */

/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Change the authenticated user's password
 *     description: |
 *       Allows the logged-in user to change their password.
 *       Requires old password for verification.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 minLength: 1
 *                 description: Current password
 *                 example: "OldSecurePass123"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *                 description: New password (minimum 8 characters)
 *                 example: "NewStrongPass456!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     message:
 *                       type: string
 *       400:
 *         description: Validation error (e.g. short new password, missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Old password incorrect
 *       404:
 *         description: User not found
 */
export const changePasswordController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = changePasswordSchema.parse(req.body);

    const result = await changePasswordService(validatedData, req.user.id);

    if (result.data) {
      return res.status(result.statusCode).json({
        message: result.message,
        data: result.data,
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
 * /user/profile:
 *   patch:
 *     summary: Update authenticated user's profile
 *     description: Update profile information (currently only name). Email, password, and role cannot be changed here.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Malik Ahmed Updated"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
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
 *                     isEmailVerified:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (not logged in)
 *       404:
 *         description: User not found
 */
export const updateProfileController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = updateProfileSchema.parse(req.body);

    const result = await updateProfileService(validatedData, req.user.id);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error: any) {
    return getCustomizedError(error, res);
  }
};
