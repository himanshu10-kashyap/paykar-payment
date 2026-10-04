export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
};