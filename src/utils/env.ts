export const env = {
  PORT: process.env.PORT || 3000,
};

const apiKey = process.env["BREVO_API_KEY"];
const senderName = process.env["BREVO_SENDER_NAME"];
const senderEmail = process.env["BREVO_SENDER_EMAIL"];
const brevoBaseUrl = process.env["BREVO_BASE_URL"];

const JWT_SECRET = process.env["JWT_SECRET"] ?? null;

export { apiKey, senderName, senderEmail, brevoBaseUrl, JWT_SECRET };
