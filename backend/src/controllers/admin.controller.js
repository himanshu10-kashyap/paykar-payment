import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { generateAdminToken } from "../utils/jwt.js";


const sanitizeAdmin = (admin) => {
    const data = admin.toJSON();
    delete data.password;
    return data;
};


export const loginAdmin = async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });

        }


        const admin = await Admin.findOne({
            where: {
                username,
            },
        });


        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });

        }


        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "Admin account is inactive",
            });

        }


        const validPassword = await bcrypt.compare(password, admin.password);


        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });

        }

        await admin.update({ lastLoginAt: new Date() });

        const token = generateAdminToken(admin);


        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                admin: sanitizeAdmin(admin),
            },
        });

    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};

export const createSubAdmin = async (req, res) => {

    try {

        const { username, password, permissions = [] } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });

        }


        const existing = await Admin.findOne({
            where: {
                username,
            },
        });


        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Username already exists",
            });

        }


        const hashedPassword = await bcrypt.hash(password, 12);


        const admin = await Admin.create({
            username,
            password: hashedPassword,
            role: "SUB_ADMIN",
            permissions: Array.isArray(permissions) ? permissions : [],
        });


        return res.status(201).json({
            success: true,
            message: "Sub admin created successfully",
            data: sanitizeAdmin(admin),
        });

    } catch (error) {
        console.error("Create sub admin error:", error);
        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });

    }

};


export const getAdmins = async (req, res) => {

    try {

        const admins = await Admin.findAll({
            where: {
                role: "SUB_ADMIN",
            },
            attributes: {
                exclude: ["password"],
            },
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            data: admins,
        });

    } catch (error) {
        console.error("Get admins error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};

export const editSubAdmin = async (req, res) => {

    try {

        const { id } = req.params;

        const { username, permissions, isActive } = req.body;

        const admin = await Admin.findByPk(id);


        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });

        }


        if (admin.role !== "SUB_ADMIN") {
            return res.status(400).json({
                success: false,
                message: "Only sub admin can be edited using this API",
            });

        }


        if (username) {
            const existing = await Admin.findOne({
                where: {
                    username,
                },
            });


            if (existing && existing.id !== admin.id) {
                return res.status(409).json({
                    success: false,
                    message: "Username already exists",
                });

            }

            admin.username = username;

        }


        if (permissions !== undefined) {
            admin.permissions = Array.isArray(permissions) ? permissions : [];
        }


        if (isActive !== undefined) {
            admin.isActive = Boolean(isActive);
        }


        await admin.save();


        return res.status(200).json({
            success: true,
            message: "Sub admin updated successfully",
            data: sanitizeAdmin(admin),
        });

    } catch (error) {
        console.error("Edit sub admin error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};


export const resetSubAdminPassword = async (req, res) => {

    try {

        const { id } = req.params;

        const { password } = req.body;


        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });

        }


        const admin = await Admin.findByPk(id);


        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });

        }


        if (admin.role !== "SUB_ADMIN") {
            return res.status(400).json({
                success: false,
                message: "Only sub admin password can be reset using this API",
            });

        }


        admin.password = await bcrypt.hash(password, 12);

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Sub admin password reset successfully",
        });

    } catch (error) {
        console.error("Reset sub admin password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};


export const changePassword = async (req, res) => {

    try {

        const { currentPassword, newPassword } = req.body;


        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });

        }


        const valid = await bcrypt.compare(currentPassword, req.admin.password);

        if (!valid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });

        }

        req.admin.password = await bcrypt.hash(newPassword, 12);

        await req.admin.save();


        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};


export const editSuperAdmin = async (req, res) => {

    try {

        const { username } = req.body;


        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Username is required",
            });

        }


        const existing = await Admin.findOne({
            where: {
                username,
            },
        });


        if (existing && existing.id !== req.admin.id) {
            return res.status(409).json({
                success: false,
                message: "Username already exists",
            });

        }


        req.admin.username = username;

        await req.admin.save();

        return res.status(200).json({
            success: true,
            message: "Super admin updated successfully",
            data: sanitizeAdmin(req.admin),
        });

    } catch (error) {
        console.error("Edit super admin error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};

export const getCurrentAdmin = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.admin,
    });
  } catch (error) {
    console.error("Get current admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const activateSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "SUB_ADMIN") {
      return res.status(400).json({
        success: false,
        message:
          "Only sub admin can be activated using this API",
      });
    }

    admin.isActive = true;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Sub admin activated successfully",
      data: sanitizeAdmin(admin),
    });

  } catch (error) {
    console.error(
      "Activate sub admin error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deactivateSubAdmin = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "SUB_ADMIN") {
      return res.status(400).json({
        success: false,
        message:
          "Only sub admin can be deactivated using this API",
      });
    }

    admin.isActive = false;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Sub admin deactivated successfully",
      data: sanitizeAdmin(admin),
    });

  } catch (error) {
    console.error(
      "Deactivate sub admin error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};