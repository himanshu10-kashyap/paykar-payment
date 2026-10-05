import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  generateCustomer,
  initiatePayment,
} from "./services/paymentApi";

import PaymentLayout from "./components/PaymentLayout";
import LoadingScreen from "./components/LoadingScreen";
import CustomerStep from "./components/CustomerStep";
import AmountStep from "./components/AmountStep";

import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentCancelled from "./pages/PaymentCancelled";


const App = () => {

  /*
   * -----------------------------------------
   * URL ROUTING
   * -----------------------------------------
   */

  const currentPath =
    window.location.pathname;


  if (
    currentPath ===
    "/payment/success"
  ) {
    return <PaymentSuccess />;
  }


  if (
    currentPath ===
    "/payment/failed"
  ) {
    return <PaymentFailed />;
  }


  if (
    currentPath ===
    "/payment/cancelled"
  ) {
    return <PaymentCancelled />;
  }


  /*
   * -----------------------------------------
   * PAYMENT FORM
   * -----------------------------------------
   */

  const [step, setStep] =
    useState(1);

  const [customer, setCustomer] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [
    loadingCustomer,
    setLoadingCustomer,
  ] = useState(true);

  const [
    loadingPayment,
    setLoadingPayment,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const paymentTimer =
    useRef(null);


  /*
   * -----------------------------------------
   * Generate customer
   * -----------------------------------------
   */

  useEffect(() => {

    loadCustomer();

    return () => {

      if (paymentTimer.current) {

        clearTimeout(
          paymentTimer.current
        );

      }

    };

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
          error?.message ||
          "Unable to generate customer details."
        );

      } finally {

        setLoadingCustomer(false);

      }

    };


  /*
   * -----------------------------------------
   * Next
   * -----------------------------------------
   */

  const handleNext = () => {

    if (!customer) {
      return;
    }

    setError("");

    setStep(2);

  };


  /*
   * -----------------------------------------
   * Amount change
   * -----------------------------------------
   */

  const handleAmountChange =
    (event) => {

      const value =
        event.target.value;


      /*
       * Only numbers and decimal
       */

      if (
        value !== "" &&
        !/^\d*\.?\d*$/.test(value)
      ) {
        return;
      }


      /*
       * Maximum amount
       */

      if (
        Number(value) > 50000
      ) {
        return;
      }


      setAmount(value);

      setError("");


      /*
       * Clear previous timer
       */

      if (paymentTimer.current) {

        clearTimeout(
          paymentTimer.current
        );

      }


      /*
       * Automatically initiate payment
       * after user stops typing.
       */

      if (
        Number(value) > 0
      ) {

        paymentTimer.current =
          setTimeout(() => {

            handlePayment(value);

          }, 800);

      }

    };


  /*
   * -----------------------------------------
   * Initiate payment
   * -----------------------------------------
   */

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


        /*
         * Redirect to Paykar
         */

        window.location.href =
          paymentUrl;

      } catch (error) {

        console.error(
          "Payment initiation error:",
          error
        );

        setError(
          error?.message ||
          "Unable to initiate payment."
        );

        setLoadingPayment(false);

      }

    };


  /*
   * -----------------------------------------
   * Back
   * -----------------------------------------
   */

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


  /*
   * -----------------------------------------
   * Loading customer
   * -----------------------------------------
   */

  if (loadingCustomer) {

    return (
      <LoadingScreen
        message="Generating customer details..."
      />
    );

  }


  /*
   * -----------------------------------------
   * Main payment page
   * -----------------------------------------
   */

  return (
    <PaymentLayout>

      {/*
       * STEP 1
       */}

      {step === 1 && (

        <CustomerStep

          customer={customer}

          error={error}

          onNext={handleNext}

        />

      )}


      {/*
       * STEP 2
       */}

      {step === 2 && (

        <AmountStep

          amount={amount}

          error={error}

          loadingPayment={
            loadingPayment
          }

          onAmountChange={
            handleAmountChange
          }

          onPayment={
            handlePayment
          }

          onBack={
            handleBack
          }

        />

      )}

    </PaymentLayout>
  );
};


export default App;