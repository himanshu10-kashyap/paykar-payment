import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  generateCustomer,
  initiatePayment,
} from "./services/paymentApi";


const App = () => {

  const [step, setStep] =
    useState(1);

  const [customer, setCustomer] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [loadingCustomer, setLoadingCustomer] =
    useState(true);

  const [loadingPayment, setLoadingPayment] =
    useState(false);

  const [error, setError] =
    useState("");

  const paymentTimer =
    useRef(null);


  // -----------------------------------------
  // Generate customer when page opens
  // -----------------------------------------

  useEffect(() => {

    loadCustomer();

  }, []);


  const loadCustomer =
    async () => {

      try {

        setLoadingCustomer(true);

        setError("");

        const data =
          await generateCustomer();

        setCustomer(data);

      } catch (error) {

        console.error(
          "Customer generation error:",
          error
        );

        setError(
          error.message ||
          "Unable to generate customer details."
        );

      } finally {

        setLoadingCustomer(false);

      }
    };


  // -----------------------------------------
  // Go to amount screen
  // -----------------------------------------

  const handleNext = () => {

    if (!customer) {
      return;
    }

    setError("");

    setStep(2);
  };


  // -----------------------------------------
  // Amount change
  // -----------------------------------------

  const handleAmountChange =
    (event) => {

      const value =
        event.target.value;


      // Allow only numbers and decimal
      if (
        value !== "" &&
        !/^\d*\.?\d*$/.test(value)
      ) {
        return;
      }


      // Maximum amount
      if (
        Number(value) > 50000
      ) {
        return;
      }


      setAmount(value);

      setError("");


      // Clear previous timer
      if (paymentTimer.current) {
        clearTimeout(
          paymentTimer.current
        );
      }


      /**
       * Automatically initiate payment
       * after user stops typing.
       *
       * Example:
       *
       * User types:
       * 1
       * 10
       * 100
       * 1000
       *
       * API will be called only after
       * typing stops.
       */

      if (
        Number(value) > 0
      ) {

        paymentTimer.current =
          setTimeout(() => {

            handlePayment(
              value
            );

          }, 800);
      }
    };


  // -----------------------------------------
  // Initiate payment
  // -----------------------------------------

  const handlePayment =
    async (paymentAmount) => {

      if (
        loadingPayment ||
        !customer
      ) {
        return;
      }


      const numericAmount =
        Number(paymentAmount);


      if (
        !numericAmount ||
        numericAmount <= 0
      ) {
        return;
      }


      if (
        numericAmount > 50000
      ) {

        setError(
          "Maximum amount is ₹50,000."
        );

        return;
      }


      try {

        setLoadingPayment(true);

        setError("");


        const result =
          await initiatePayment({
            customer,
            amount: numericAmount,
          });


        console.log(
          "Payment initiated:",
          result
        );


        const paymentUrl =
          result?.data?.payment_url ||
          result?.data?.checkoutUrl ||
          result?.paykarResponse?.payment_url;


        if (!paymentUrl) {

          throw new Error(
            "Payment URL was not received."
          );
        }


        // Redirect to Paykar
        window.location.href =
          paymentUrl;

      } catch (error) {

        console.error(
          "Payment initiation error:",
          error
        );

        setError(
          error.message ||
          "Unable to initiate payment."
        );

        setLoadingPayment(false);
      }
    };


  // -----------------------------------------
  // Back
  // -----------------------------------------

  const handleBack = () => {

    if (loadingPayment) {
      return;
    }

    if (paymentTimer.current) {
      clearTimeout(
        paymentTimer.current
      );
    }

    setAmount("");

    setError("");

    setStep(1);
  };


  // -----------------------------------------
  // Loading customer
  // -----------------------------------------

  if (
    loadingCustomer
  ) {

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

            <div className="loading-container">

              <div className="spinner"></div>

              <p>
                Generating customer details...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }


  return (
    <div className="payment-page">

      <div className="payment-card">

        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="payment-header">

          <h1>
            Alina Overseas
          </h1>

          <div className="secure-badge">
            Secure Payment
          </div>

        </div>


        {/* -------------------------------- */}
        {/* Body */}
        {/* -------------------------------- */}

        <div className="payment-body">

          {/* ============================== */}
          {/* STEP 1 */}
          {/* ============================== */}

          {step === 1 && (

            <>
              <div className="form-group">

                <label>
                  Customer Name
                </label>

                <input
                  type="text"
                  value={
                    customer?.customerName ||
                    ""
                  }
                  readOnly
                />

              </div>


              <div className="form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={
                    customer?.customerEmail ||
                    ""
                  }
                  readOnly
                />

              </div>


              <div className="form-group">

                <label>
                  Mobile Number
                </label>

                <input
                  type="text"
                  value={
                    customer?.customerMobile ||
                    ""
                  }
                  readOnly
                />

              </div>


              {error && (

                <div className="error-message">
                  {error}
                </div>

              )}


              <button
                type="button"
                className="payment-button"
                onClick={handleNext}
                disabled={!customer}
              >
                Next
              </button>

            </>
          )}


          {/* ============================== */}
          {/* STEP 2 */}
          {/* ============================== */}

          {step === 2 && (

            <>
              <div className="form-group">

                <label>
                  Amount
                </label>

                <div className="amount-wrapper">

                  <span className="currency-symbol">
                    ₹
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={
                      handleAmountChange
                    }
                    autoFocus
                    disabled={loadingPayment}
                  />

                </div>

                <div className="amount-help">
                  Maximum amount is ₹50,000.
                </div>

              </div>


              {error && (

                <div className="error-message">
                  {error}
                </div>

              )}


              <button
                type="button"
                className="payment-button"
                onClick={() =>
                  handlePayment(amount)
                }
                disabled={
                  loadingPayment ||
                  !amount ||
                  Number(amount) <= 0
                }
              >

                {loadingPayment
                  ? "Processing..."
                  : "Pay"}

              </button>


              <button
                type="button"
                className="back-button"
                onClick={handleBack}
                disabled={loadingPayment}
              >
                Back
              </button>

            </>
          )}

        </div>

      </div>

    </div>
  );
};


export default App;