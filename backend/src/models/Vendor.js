import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Vendor = sequelize.define(
  "Vendor",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "company_name",
    },

    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },

    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: "created_by",
    },
  },

  {
    tableName: "vendors",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      {
        unique: true,
        fields: ["slug"],
      },
      {
        fields: ["is_active"],
      },
      {
        fields: ["created_by"],
      },
    ],
  }
);

export default Vendor;