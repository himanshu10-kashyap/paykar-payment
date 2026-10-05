import api from "./api";

export const getPayments = async ({
  page = 1,
  limit = 10,
  vendorId = "",
  status = "",
  paymentStatus = "",
  dateFrom = "",
  dateTo = "",
  paymentMethod = "",
  currency = "",
  environment = "",
  search = "",
  minAmount = "",
  maxAmount = "",
  sortBy = "createdAt",
  sortOrder = "DESC",
} = {}) => {
  const params = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  if (vendorId) {
    params.vendorId = vendorId;
  }

  if (status) {
    params.status = status;
  }

  if (paymentStatus) {
    params.paymentStatus = paymentStatus;
  }

  if (dateFrom) {
    params.dateFrom = dateFrom;
  }

  if (dateTo) {
    params.dateTo = dateTo;
  }

  if (paymentMethod) {
    params.paymentMethod = paymentMethod;
  }

  if (currency) {
    params.currency = currency;
  }

  if (environment) {
    params.environment = environment;
  }

  if (search) {
    params.search = search.trim();
  }

  if (minAmount !== "") {
    params.minAmount = minAmount;
  }

  if (maxAmount !== "") {
    params.maxAmount = maxAmount;
  }

  const response = await api.get(
    "/api/payments",
    {
      params,
    }
  );

  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await api.get(
    `/api/payments/${id}`
  );

  return response.data;
};