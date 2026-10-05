import {
  useEffect,
  useState,
} from "react";

import {
  verifyPayment,
} from "../services/paymentApi";

import PaymentLayout from "../components/PaymentLayout";


const PaymentSuccess = () => {

  const [loading, setLoading] =
    useState(true);

  const [verified, setVerified] =
    useState(false);

  const [payment, setPayment] =
    useState(null);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const verify = async () => {

      try {

        setLoading(true);
        setError("");

        const params =
          new URLSearchParams(
            window.location.search
          );

        const trxId =
          params.get("trx_id");


        if (!trxId) {

          throw new Error(
            "Transaction ID was not received."
          );

        }


        console.log(
          "Verifying Paykar transaction:",
          trxId
        );


        const result =
          await verifyPayment(trxId);


        console.log(
          "Paykar verification response:",
          result
        );


        const status =
          result?.data?.status ||
          result?.paykarResponse?.status;


        if (
          result?.success &&
          (
            status === "success" ||
            status === "completed"
          )
        ) {

          setPayment(
            result?.data || {}
          );

          setVerified(true);

          return;
        }


        throw new Error(
          result?.message ||
          "Payment could not be verified."
        );

      } catch (error) {

        console.error(
          "Payment verification error:",
          error
        );

        setError(
          error?.message ||
          "Payment verification failed."
        );

      } finally {

        setLoading(false);

      }
    };


    verify();

  }, []);


  if (loading) {

    return (
      <PaymentLayout>

        <div className="verification-container">

          <div className="spinner"></div>

          <h2>
            Verifying Transaction
          </h2>

          <p>
            Please wait while we verify
            your payment.
          </p>

        </div>

      </PaymentLayout>
    );

  }


  if (!verified) {

    return (
      <PaymentLayout>

        <div className="payment-result failed">

          <div className="failed-icon">
            !
          </div>

          <h2>
            Payment Verification Failed
          </h2>

          <p>
            {error ||
              "We could not verify this transaction."}
          </p>

        </div>

      </PaymentLayout>
    );

  }


  return (
    <PaymentLayout>

      <div className="payment-result success">

        <div className="success-icon">
          ✓
        </div>


        <h2>
          Transaction Verified
        </h2>


        <p>
          Your payment has been
          successfully verified.
        </p>


        <div className="transaction-details">

          {payment?.trx_id && (
            <div className="transaction-row">

              <span>
                Transaction ID
              </span>

              <strong>
                {payment.trx_id}
              </strong>

            </div>
          )}


          {payment?.ref_trx && (
            <div className="transaction-row">

              <span>
                Order ID
              </span>

              <strong>
                {payment.ref_trx}
              </strong>

            </div>
          )}


          {payment?.amount !== undefined && (
            <div className="transaction-row">

              <span>
                Amount
              </span>

              <strong>
                ₹{payment.amount}
              </strong>

            </div>
          )}


          {payment?.currency && (
            <div className="transaction-row">

              <span>
                Currency
              </span>

              <strong>
                {payment.currency}
              </strong>

            </div>
          )}


          {payment?.description && (
            <div className="transaction-row">

              <span>
                Description
              </span>

              <strong>
                {payment.description}
              </strong>

            </div>
          )}


          <div className="transaction-row">

            <span>
              Status
            </span>

            <strong className="verified-status">
              VERIFIED
            </strong>

          </div>

        </div>

      </div>

    </PaymentLayout>
  );
};

export default PaymentSuccess;