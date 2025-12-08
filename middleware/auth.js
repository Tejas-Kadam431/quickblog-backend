import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  // 1️⃣ Check if token is present
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    // 2️⃣ Verify the token
    jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ If valid, continue to the route/controller
    next();
  } catch (error) {
    // 4️⃣ If invalid/expired, respond with 403
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

export default auth;
