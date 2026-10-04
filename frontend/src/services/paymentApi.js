const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://paykar.api.dummydoma.in";


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
      data.message ||
      "Failed to generate customer"
    );
  }


  return data.data;
};


/**
 * Generate unique order ID
 */
const generateOrderId = () => {
  return `ORDER_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
};


/**
 * Generate idempotency key
 */
const generateIdempotencyKey = () => {
  return `PAY_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase()}`;
};


/**
 * Initiate Paykar payment
 */
export const initiatePayment = async ({
  customer,
  amount,
}) => {

  const orderId =
    generateOrderId();

  const idempotencyKey =
    generateIdempotencyKey();


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

        // IMPORTANT
        currency: "INR",

        description:
          `Payment for ${orderId}`,

        successRedirect:
          `${window.location.origin}/payment/success`,

        failureUrl:
          `${window.location.origin}/payment/failed`,

        cancelRedirect:
          `${window.location.origin}/payment/cancelled`,

        ipnUrl:
          `${window.location.origin}/api/webhooks/paykar`,

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
      data.message ||
      "Payment initiation failed"
    );
  }


  return data;
};