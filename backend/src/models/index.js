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
  as: "payments",
});

Payment.belongsTo(Vendor, {
  foreignKey: "vendorId",
  as: "vendor",
});

export {
  Admin,
  Vendor,
  Payment,
};