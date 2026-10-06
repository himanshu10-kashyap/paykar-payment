import Admin from "../models/Admin.js";
import { verifyAdminToken } from "../utils/jwt.js";


export const authenticateAdmin = async (req, res, next) => {

    try {

        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required",
            });

        }


        const token = authorization.split(" ")[1];
        const decoded = verifyAdminToken(token);
        const admin = await Admin.findByPk(decoded.id);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin account not found",
            });

        }


        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "Admin account is inactive",
            });

        }

        req.admin = admin;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token",
        });

    }

};

export const requireSuperAdmin = (req, res, next) => {
  const role = req.admin?.role || req.user?.role;

  if (role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only super admin can perform this action",
    });
  }

  next();
};