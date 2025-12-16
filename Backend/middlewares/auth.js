// middlewares/auth.js
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev_secret";

// Optional: decode token if present, attach req.userId
export const verifyTokenOptional = (req, res, next) => {
  const auth = req.headers?.authorization;
  if (!auth) return next();

  const parts = auth.split(" ");
  if (parts.length !== 2) return next();

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
  } catch (err) {
    // invalid token -> ignore (don't set req.userId)
  }
  return next();
};

// Strict: require token and set req.userId, else 401
export const requireAuth = (req, res, next) => {
  const auth = req.headers?.authorization;
  if (!auth) return res.status(401).json({ success: false, message: "Authorization required" });

  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ success: false, message: "Invalid auth header" });

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
