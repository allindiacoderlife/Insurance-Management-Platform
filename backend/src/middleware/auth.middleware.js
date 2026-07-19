import jwt from "jsonwebtoken";
import { config } from "../config/app.config.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication token missing or invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        customer: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "User associated with this token no longer exists");
    }

    // Omit password from req.user
    const { password: _pwd, ...sanitizedUser } = user;
    req.user = sanitizedUser;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      throw new ApiError(401, "Invalid or expired token");
    }
    throw err;
  }
});

export const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "User not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden. Required role(s): ${allowedRoles.join(", ")}`
        )
      );
    }

    next();
  };
};
