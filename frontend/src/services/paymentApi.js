const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://paykar.api.dummydoma.in/api";

/**
 * Generate customer
 */
export const generateCustomer = async () => {
  const response = await fetch(
    `${API_BASE_URL}/payments/generate-customer`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data?.message ||
      "Failed to generate customer"
    );
  }

  return data.data;
};


/**
 * Initiate Paykar payment
 */
export const initiatePayment = async ({
  customer,
  amount,
}) => {

  const orderId =
    `ORDER_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

  const idempotencyKey =
    `PAY_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

  const response = await fetch(
    `${API_BASE_URL}/payments/initiate`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        orderId,

        customerName:
          customer.customerName,

        customerEmail:
          customer.customerEmail,

        customerMobile:
          customer.customerMobile,

        amount: Number(amount),

        currency: "INR",

        description:
          `Payment for ${orderId}`,

        successRedirect:
          `${window.location.origin}/payment/success`,

        failureUrl:
          `${window.location.origin}/payment/failed`,

        cancelRedirect:
          `${window.location.origin}/payment/cancelled`,

        idempotencyKey,
      }),
    }
  );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data?.message ||
      "Payment initiation failed"
    );
  }

  return data;
};


/**
 * Verify Paykar payment
 */
export const verifyPayment = async (
  trxId
) => {

  if (!trxId) {
    throw new Error(
      "Transaction ID is required."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/payments/verify/${encodeURIComponent(
      trxId
    )}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      "Payment verification failed."
    );
  }

  return data;
};