import PaymentLayout from "../components/PaymentLayout";

const PaymentFailed = () => {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const trxId =
    params.get("trx_id");

  return (
    <PaymentLayout>

      <div className="payment-result failed">

        <div className="failed-icon">
          !
        </div>

        <h2>
          Payment Failed
        </h2>

        <p>
          Your payment could not be completed.
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

              <strong className="failed-status">
                FAILED
              </strong>

            </div>

          </div>
        )}

      </div>

    </PaymentLayout>
  );
};

export default PaymentFailed;