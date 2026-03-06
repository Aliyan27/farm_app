import { apiKey, brevoBaseUrl, senderEmail, senderName } from "../../utils/env";
export const sendOTP = async (email: string, otp: string) => {
  if (!apiKey) throw new Error("BREVO_API_KEY missing");
  if (!senderName) throw new Error("BREVO_SENDER_NAME missing");
  if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL missing");
  if (!brevoBaseUrl) throw new Error("BREVO_BASE_URL missing");

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email }],
    subject: "Reset Your Farm App Password",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p style="margin: 30px 0; text-align: center;">
          ${otp}
        </p>
        <p>This OTP expires in <strong>60 seconds</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #777; font-size: 12px; text-align: center;">
          Farm App | Islamabad, Pakistan
        </p>
      </div>
    `,
  };

  const response = await fetch(brevoBaseUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Brevo failed: ${response.status} - ${JSON.stringify(err)}`,
    );
  }

  return await response.json();
};
