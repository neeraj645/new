import AppError from "../utils/appError.js";
import { verifyAccessToken } from "../helper/token.helper.js";
import { STATUS_CODES } from "../constants/statusCodes.js";

export default (...roles) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError("No token provided", STATUS_CODES.UNAUTHORIZED);
      }

      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);

      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      if (roles.length && !roles.includes(decoded.role)) {
        throw new AppError("Access denied", STATUS_CODES.FORBIDDEN);
      }

      next();
    } catch (error) {
      next(
        error instanceof AppError
          ? error
          : new AppError(
              "Invalid or expired token",
              STATUS_CODES.UNAUTHORIZED
            )
      );
    }
  };
};