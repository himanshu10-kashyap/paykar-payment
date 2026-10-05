import Admin from "./Admin.js";
import Vendor from "./Vendor.js";
import Payment from "./Payment.js";

Admin.hasMany(Vendor, {
  foreignKey: "createdBy",
  as: "vendors",
});

Vendor.belongsTo(Admin, {
  foreignKey: "createdBy",
  as: "creator",
});

Vendor.hasMany(Payment, {
  foreignKey: "vendorId",
  sourceKey: "id",
  as: "payments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Payment.belongsTo(Vendor, {
  foreignKey: "vendorId",
  targetKey: "id",
  as: "vendor",
});

export {
  Admin,
  Vendor,
  Payment,
};