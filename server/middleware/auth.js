import { sql } from "../config/db.js";
import jwt from "jsonwebtoken";

// Mandatory authentication guard reading token directly from cookie
export const protect = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please login." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] =
      await sql`SELECT id, name, email, storage_limit,storage_used,created_at,updated_at FROM users WHERE id = ${decoded.id}`;
    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }
    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Token invalid or expired. Please log in again." });
  }
};
