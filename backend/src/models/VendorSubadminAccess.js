import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const VendorSubadminAccess = sequelize.define(
  "VendorSubadminAccess",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    vendorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "vendor_id",
    },

    subadminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "subadmin_id",
    },
  },
  {
    tableName: "vendor_subadmin_access",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      {
        unique: true,
        fields: ["vendor_id", "subadmin_id"],
      },
      {
        fields: ["vendor_id"],
      },
      {
        fields: ["subadmin_id"],
      },
    ],
  }
);

export default VendorSubadminAccess;