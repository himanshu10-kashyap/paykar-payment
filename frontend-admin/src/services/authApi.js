import api from "./api";

export const loginAdmin = async ({ username, password }) => {
  const response = await api.post("/api/admin/login", {
    username,
    password,
  });

  return response.data;
};

export const getCurrentAdmin = async () => {
  const response = await api.get("/api/admin/me");

  return response.data;
};

export const logoutAdmin = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("admin");
};