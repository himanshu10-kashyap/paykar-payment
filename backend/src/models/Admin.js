import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM(
        "SUPER_ADMIN",
        "SUB_ADMIN"
      ),
      allowNull: false,
      defaultValue: "SUB_ADMIN",
    },

    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },

    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login_at",
    },

  },
  {
    tableName: "admins",

    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["username"],
      },
      {
        fields: ["role"],
      },
      {
        fields: ["is_active"],
      },
    ],
  }
);

export default Admin;