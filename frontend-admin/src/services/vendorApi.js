import api from "./api";

/*
|--------------------------------------------------------------------------
| Get all vendors
|--------------------------------------------------------------------------
*/

export const getVendors = async () => {
  const response = await api.get("/api/admin/vendors");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get single vendor
|--------------------------------------------------------------------------
*/

export const getVendor = async (id) => {
  const response = await api.get(`/api/admin/vendors/${id}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Create vendor
|--------------------------------------------------------------------------
*/

export const createVendor = async ({ companyName, slug }) => {
  const response = await api.post("/api/admin/vendors", {
    companyName,
    slug,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Edit vendor
|--------------------------------------------------------------------------
*/

export const editVendor = async ({
  id,
  companyName,
  slug,
}) => {
  const response = await api.put(`/api/admin/vendors/${id}`, {
    companyName,
    slug,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Activate vendor
|--------------------------------------------------------------------------
*/

export const activateVendor = async (id) => {
  const response = await api.patch(
    `/api/admin/vendors/${id}/activate`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Deactivate vendor
|--------------------------------------------------------------------------
*/

export const deactivateVendor = async (id) => {
  const response = await api.patch(
    `/api/admin/vendors/${id}/deactivate`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Delete vendor
|--------------------------------------------------------------------------
*/

export const deleteVendor = async (id) => {
  const response = await api.delete(
    `/api/admin/vendors/${id}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get vendor payments
|--------------------------------------------------------------------------
*/

export const getVendorPayments = async (id) => {
  const response = await api.get(
    `/api/admin/vendors/${id}/payments`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get public vendor by slug
|--------------------------------------------------------------------------
| This API does NOT require admin authentication.
| It will be used by customer frontend.
|--------------------------------------------------------------------------
*/

export const getPublicVendorBySlug = async (slug) => {
  const response = await api.get(
    `/api/admin/vendors/public/${encodeURIComponent(slug)}`
  );

  return response.data;
};