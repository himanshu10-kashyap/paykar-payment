// import {
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// import {
//   generateCustomer,
//   initiatePayment,
// } from "./services/paymentApi";

// import PaymentLayout from "./components/PaymentLayout";
// import LoadingScreen from "./components/LoadingScreen";
// import AmountStep from "./components/AmountStep";

// import PaymentSuccess from "./pages/PaymentSuccess";
// import PaymentFailed from "./pages/PaymentFailed";
// import PaymentCancelled from "./pages/PaymentCancelled";


// const PaymentPage = () => {

//   const [customer, setCustomer] =
//     useState(null);

//   const [amount, setAmount] =
//     useState("");

//   const [
//     loadingCustomer,
//     setLoadingCustomer,
//   ] = useState(true);

//   const [
//     loadingPayment,
//     setLoadingPayment,
//   ] = useState(false);

//   const [error, setError] =
//     useState("");

//   const paymentTimer =
//     useRef(null);


//   useEffect(() => {

//     loadCustomer();

//     return () => {

//       if (paymentTimer.current) {
//         clearTimeout(paymentTimer.current);
//       }

//     };

//   }, []);


//   const loadCustomer = async () => {

//     try {

//       setLoadingCustomer(true);
//       setError("");

//       // Customer details are generated internally.
//       // They will NOT be shown to the user.
//       const data =
//         await generateCustomer();

//       setCustomer(data);

//     } catch (error) {

//       console.error(
//         "Customer generation error:",
//         error
//       );

//       setError(
//         error?.message ||
//         "Unable to generate customer details."
//       );

//     } finally {

//       setLoadingCustomer(false);

//     }

//   };


//   const handleAmountChange = (event) => {

//     const value =
//       event.target.value;


//     if (
//       value !== "" &&
//       !/^\d*\.?\d*$/.test(value)
//     ) {
//       return;
//     }


//     if (Number(value) > 50000) {
//       return;
//     }


//     setAmount(value);
//     setError("");


//     if (paymentTimer.current) {
//       clearTimeout(paymentTimer.current);
//     }


//     if (Number(value) > 0) {

//       paymentTimer.current =
//         setTimeout(() => {

//           handlePayment(value);

//         }, 800);

//     }

//   };


//   const handlePayment =
//     async (paymentAmount) => {

//       if (
//         loadingPayment ||
//         !customer
//       ) {
//         return;
//       }


//       const numericAmount =
//         Number(paymentAmount);


//       if (
//         !numericAmount ||
//         numericAmount <= 0
//       ) {
//         return;
//       }


//       if (numericAmount > 50000) {

//         setError(
//           "Maximum amount is ₹50,000."
//         );

//         return;

//       }


//       try {

//         setLoadingPayment(true);
//         setError("");


//         const result =
//           await initiatePayment({
//             customer,
//             amount: numericAmount,
//           });


//         console.log(
//           "Payment initiated:",
//           result
//         );


//         const paymentUrl =
//           result?.data?.payment_url ||
//           result?.data?.checkoutUrl ||
//           result?.paykarResponse?.payment_url;


//         if (!paymentUrl) {

//           throw new Error(
//             "Payment URL was not received."
//           );

//         }


//         window.location.href =
//           paymentUrl;

//       } catch (error) {

//         console.error(
//           "Payment initiation error:",
//           error
//         );

//         setError(
//           error?.message ||
//           "Unable to initiate payment."
//         );

//         setLoadingPayment(false);

//       }

//     };


//   if (loadingCustomer) {

//     return (
//       <LoadingScreen
//         message="Please wait..."
//       />
//     );

//   }


//   return (
//     <PaymentLayout>

//       <AmountStep
//         amount={amount}
//         error={error}
//         loadingPayment={loadingPayment}
//         onAmountChange={handleAmountChange}
//         onPayment={handlePayment}
//       />

//     </PaymentLayout>
//   );
// };


// const App = () => {

//   const pathname =
//     window.location.pathname;


//   if (
//     pathname === "/payment/success"
//   ) {
//     return <PaymentSuccess />;
//   }


//   if (
//     pathname === "/payment/failed"
//   ) {
//     return <PaymentFailed />;
//   }


//   if (
//     pathname === "/payment/cancelled"
//   ) {
//     return <PaymentCancelled />;
//   }


//   return <PaymentPage />;
// };


// export default App;


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
import AmountStep from "./components/AmountStep";

import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentCancelled from "./pages/PaymentCancelled";


/**
 * Get vendor slug from URL.
 *
 * Example:
 *
 * https://paykar.dummydoma.in/99wickets
 *
 * pathname:
 * /99wickets
 *
 * vendorSlug:
 * 99wickets
 */
const getVendorSlugFromUrl = () => {

  const pathname =
    window.location.pathname;


  const segments =
    pathname
      .split("/")
      .filter(Boolean);


  if (!segments.length) {
    return "";
  }


  return decodeURIComponent(
    segments[0]
  ).trim();

};


/**
 * Get payment status from URL.
 *
 * Example:
 *
 * /99wickets?payment_status=success
 */
const getPaymentStatusFromUrl = () => {

  const params =
    new URLSearchParams(
      window.location.search
    );


  return params.get(
    "payment_status"
  );

};


const InvalidPaymentLink = () => {

  return (
    <PaymentLayout>

      <div className="payment-result failed">

        <div className="failed-icon">
          !
        </div>

        <h2>
          Invalid Payment Link
        </h2>

        <p>
          This payment link is not valid.
        </p>

      </div>

    </PaymentLayout>
  );

};


const PaymentPage = ({
  vendorSlug,
}) => {

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


  const loadCustomer = async () => {

    try {

      setLoadingCustomer(true);

      setError("");


      /*
       * Customer details are generated
       * internally.
       *
       * They are not displayed
       * to the user.
       */
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


  const handleAmountChange = (
    event
  ) => {

    const value =
      event.target.value;


    /*
     * Allow only:
     *
     * 123
     * 123.45
     */
    if (
      value !== "" &&
      !/^\d*\.?\d*$/.test(value)
    ) {

      return;

    }


    /*
     * Maximum amount:
     * ₹50,000
     */
    if (
      Number(value) > 50000
    ) {

      return;

    }


    setAmount(value);

    setError("");


    if (paymentTimer.current) {

      clearTimeout(
        paymentTimer.current
      );

    }


    /*
     * Auto initiate payment
     * after amount is entered.
     */
    if (Number(value) > 0) {

      paymentTimer.current =
        setTimeout(() => {

          handlePayment(value);

        }, 800);

    }

  };


  const handlePayment =
    async (paymentAmount) => {

      if (
        loadingPayment ||
        !customer
      ) {

        return;

      }


      if (!vendorSlug) {

        setError(
          "Invalid vendor payment link."
        );

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


        console.log(
          "Starting payment for vendor:",
          vendorSlug
        );


        const result =
          await initiatePayment({
            customer,
            amount: numericAmount,
            vendorSlug,
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
         * Redirect to Paykar checkout.
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


  if (loadingCustomer) {

    return (
      <LoadingScreen
        message="Please wait..."
      />
    );

  }


  return (
    <PaymentLayout>

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
      />

    </PaymentLayout>
  );

};


const App = () => {

  const pathname =
    window.location.pathname;


  const paymentStatus =
    getPaymentStatusFromUrl();


  const vendorSlug =
    getVendorSlugFromUrl();


  /*
   * Same vendor URL is used for
   * success / failed / cancelled.
   *
   * Example:
   *
   * /99wickets?payment_status=success
   * /99wickets?payment_status=failed
   * /99wickets?payment_status=cancelled
   */


  if (
    paymentStatus === "success"
  ) {

    return <PaymentSuccess />;

  }


  if (
    paymentStatus === "failed"
  ) {

    return <PaymentFailed />;

  }


  if (
    paymentStatus === "cancelled"
  ) {

    return <PaymentCancelled />;

  }


  /*
   * Do NOT open payment page
   * on root/main URL.
   *
   * Vendor URL is required.
   */
  if (!vendorSlug) {

    return (
      <InvalidPaymentLink />
    );

  }


  return (
    <PaymentPage
      vendorSlug={
        vendorSlug
      }
    />
  );

};


export default App;