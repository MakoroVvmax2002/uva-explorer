const crypto = require("crypto");

function getAdminSecret() {
  return process.env.ADMIN_SECRET;
}

function createToken() {
  const payload = {
    role: "admin",
    createdAt: Date.now(),
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", getAdminSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  if (!token) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [payload, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", getAdminSecret())
    .update(payload)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    // Session expires after 4 hours
    const fourHours = 4 * 60 * 60 * 1000;

    if (Date.now() - data.createdAt > fourHours) {
      return false;
    }

    return data.role === "admin";
  } catch {
    return false;
  }
}

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Admin authentication required",
    });
  }

  const token = authHeader.substring(7);

  if (!verifyToken(token)) {
    return res.status(401).json({
      message: "Invalid or expired admin session",
    });
  }

  next();
}

module.exports = {
  adminAuth,
  createToken,
};