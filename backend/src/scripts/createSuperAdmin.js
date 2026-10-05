import "dotenv/config";
import bcrypt from "bcryptjs";
import sequelize from "../config/database.js";
import Admin from "../models/Admin.js";


const createSuperAdmin = async () => {

    try {

        await sequelize.authenticate();


        const username = "admin";

        const password = "123456";


        if (!username || !password) {
            throw new Error("SUPER_ADMIN_USERNAME and SUPER_ADMIN_PASSWORD are required");
        }


        const existing = await Admin.findOne({
            where: {
                username,
            },
        });


        if (existing) {
            console.log("Super admin already exists.");
            process.exit(0);
        }


        const hashedPassword = await bcrypt.hash(password, 12);


        await Admin.create({
            username,
            password: hashedPassword,
            role: "SUPER_ADMIN",
            permissions: null,
            isActive: true,
        });


        console.log("Super admin created successfully.");

        process.exit(0);

    } catch (error) {
        console.error("Create super admin error:", error);
        process.exit(1);
    }

};


createSuperAdmin();