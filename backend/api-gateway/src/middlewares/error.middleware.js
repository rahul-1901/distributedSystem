export const errorMiddleware = (err, req, res, next) => {
    console.error("API Gateway Error:", err);
  
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "API Gateway internal server error",
    });
  };