const jwt = require("jsonwebtoken");

// Middleware to validate JWT token and extract name and email
const validateJwtToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      name: decoded.name,
      email: decoded.email,
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = validateJwtToken;
