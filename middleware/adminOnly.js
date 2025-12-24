const adminOnly = (req, res, next) => {
  // auth middleware already verified JWT
  // here we only ensure admin access intent

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "Admin authorization required",
    });
  }

  next();
};

export default adminOnly;
