import api from "./api";


/*
|--------------------------------------------------------------------------
| Get all sub admins
|--------------------------------------------------------------------------
*/

export const getAdmins = async () => {
  const response = await api.get(
    "/api/admin"
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Create sub admin
|--------------------------------------------------------------------------
*/

export const createSubAdmin = async ({
  username,
  password,
  permissions,
}) => {
  const response = await api.post(
    "/api/admin/sub-admin",
    {
      username,
      password,
      permissions,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Edit sub admin
|--------------------------------------------------------------------------
*/

export const editSubAdmin = async ({
  id,
  username,
  permissions,
  isActive,
}) => {
  const response = await api.put(
    `/api/admin/sub-admin/${id}`,
    {
      username,
      permissions,
      isActive,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Activate sub admin
|--------------------------------------------------------------------------
*/

export const activateSubAdmin = async (
  id
) => {
  const response = await api.patch(
    `/api/admin/sub-admin/${id}/activate`
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Deactivate sub admin
|--------------------------------------------------------------------------
*/

export const deactivateSubAdmin = async (
  id
) => {
  const response = await api.patch(
    `/api/admin/sub-admin/${id}/deactivate`
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Reset sub admin password
|--------------------------------------------------------------------------
*/

export const resetSubAdminPassword = async ({
  id,
  password,
}) => {
  const response = await api.patch(
    `/api/admin/sub-admin/${id}/reset-password`,
    {
      password,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Change own password
|--------------------------------------------------------------------------
*/

export const changeAdminPassword = async ({
  currentPassword,
  newPassword,
}) => {
  const response = await api.post(
    "/api/admin/change-password",
    {
      currentPassword,
      newPassword,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Edit super admin
|--------------------------------------------------------------------------
*/

export const editSuperAdmin = async ({
  username,
}) => {
  const response = await api.put(
    "/api/admin/super-admin",
    {
      username,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Delete sub admin
|--------------------------------------------------------------------------
*/

export const deleteSubAdmin = async (
  id
) => {
  const response = await api.delete(
    `/api/admin/sub-admin/${id}`
  );

  return response.data;
};