import { STATUS_CODES } from "../constants/statusCodes.js";
import { AppError } from "../errors/AppError.js";

//For RoleBaseAccess -> Handles Role-Based Access Control
const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError("Unauthorized", STATUS_CODES.UNAUTHORIZED));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError("Forbidden", 403));
        }

        next();
    };
};

export { allowRoles };
