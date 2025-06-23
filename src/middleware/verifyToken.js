import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  try {
    const token = req.cookies.token || req.cookies.adminToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // e.g., { id: "...", role: "Admin" }
    next();
  } catch (err) {
    res
      .status(401)
      .json({ message: "Invalid or expired token", error: err.message });
  }
}
