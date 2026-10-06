import api from "./api";

/**
 * Get all vendors assigned to a sub admin
 */
export const getSubadminVendors = async (subadminId) => {
  const response = await api.get(
    `/api/admin/vendor-access/subadmins/${subadminId}/vendors`
  );

  return response.data;
};

/**
 * Get all sub admins assigned to a vendor
 */
export const getVendorSubadmins = async (vendorId) => {
  const response = await api.get(
    `/api/admin/vendor-access/vendors/${vendorId}/subadmins`
  );

  return response.data;
};

/**
 * Assign vendor to sub admin
 */
export const assignVendorToSubadmin = async ({
  vendorId,
  subadminId,
}) => {
  const response = await api.post(
    `/api/admin/vendor-access/vendors/${vendorId}/subadmins/${subadminId}`
  );

  return response.data;
};

/**
 * Remove vendor from sub admin
 */
export const removeVendorFromSubadmin = async ({
  vendorId,
  subadminId,
}) => {
  const response = await api.delete(
    `/api/admin/vendor-access/vendors/${vendorId}/subadmins/${subadminId}`
  );

  return response.data;
};