export function isAdmin(req, res, next) {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
