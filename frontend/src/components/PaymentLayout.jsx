const PaymentLayout = ({
  children,
}) => {
  return (
    <div className="payment-page">
      <div className="payment-card">

        <div className="payment-header">

          <h1>
            Alina Overseas
          </h1>

          <div className="secure-badge">
            Secure Payment
          </div>

        </div>

        <div className="payment-body">
          {children}
        </div>

      </div>
    </div>
  );
};

export default PaymentLayout;