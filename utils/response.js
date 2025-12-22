export const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode = 500, message = "Server Error") => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
