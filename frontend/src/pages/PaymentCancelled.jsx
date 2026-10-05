import PaymentLayout from "../components/PaymentLayout";

const PaymentCancelled = () => {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const trxId =
    params.get("trx_id");

  return (
    <PaymentLayout>

      <div className="payment-result cancelled">

        <div className="cancelled-icon">
          ×
        </div>

        <h2>
          Payment Cancelled
        </h2>

        <p>
          The payment was cancelled.
        </p>


        {trxId && (
          <div className="transaction-details">

            <div className="transaction-row">

              <span>
                Transaction ID
              </span>

              <strong>
                {trxId}
              </strong>

            </div>

            <div className="transaction-row">

              <span>
                Status
              </span>

              <strong className="cancelled-status">
                CANCELLED
              </strong>

            </div>

          </div>
        )}

      </div>

    </PaymentLayout>
  );
};

export default PaymentCancelled;