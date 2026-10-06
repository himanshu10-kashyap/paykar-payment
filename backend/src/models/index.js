import Admin from "./Admin.js";
import Vendor from "./Vendor.js";
import Payment from "./Payment.js";
import VendorSubadminAccess from "./VendorSubadminAccess.js";

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

Vendor.hasMany(VendorSubadminAccess, {
  foreignKey: "vendorId",
  sourceKey: "id",
  as: "subadminAccess",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

VendorSubadminAccess.belongsTo(Vendor, {
  foreignKey: "vendorId",
  targetKey: "id",
  as: "vendor",
});

export {
  Admin,
  Vendor,
  Payment,
  VendorSubadminAccess
};