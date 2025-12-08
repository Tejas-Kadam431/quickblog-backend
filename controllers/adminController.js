import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 🛡 Add expiry to token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
