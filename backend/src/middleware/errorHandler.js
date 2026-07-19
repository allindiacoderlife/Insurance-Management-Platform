export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  const errorMessage = err.message || (typeof err === "string" ? err : "Unknown Error");
  console.error("❌ Backend Error Details:");
  console.dir(err, { depth: null }); // This will print EVERYTHING in the error object

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    error: err.name || "Error",
    details: err.details || err.message || "No additional details",
    ...(process.env.NODE_ENV !== "production" ? { raw: err } : {}),
  });
};
