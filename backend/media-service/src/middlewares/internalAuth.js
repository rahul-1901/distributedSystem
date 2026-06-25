export const verifyInternalService = (
    req,
    res,
    next
  ) => {
    const token =
      req.headers["x-service-secret"];
  
    if (
      !token ||
      token !== process.env.INTERNAL_SERVICE_SECRET
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized service",
      });
    }
  
    next();
  };