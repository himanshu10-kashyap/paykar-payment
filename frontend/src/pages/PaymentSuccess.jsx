// import {
//   useEffect,
//   useState,
// } from "react";

// import {
//   verifyPayment,
// } from "../services/paymentApi";

// import PaymentLayout from "../components/PaymentLayout";


// const PaymentSuccess = () => {

//   const [loading, setLoading] =
//     useState(true);

//   const [payment, setPayment] =
//     useState(null);

//   const [error, setError] =
//     useState("");


//   useEffect(() => {

//     const verify = async () => {

//       try {

//         setLoading(true);
//         setError("");


//         const params =
//           new URLSearchParams(
//             window.location.search
//           );


//         const trxId =
//           params.get("trx_id");


//         if (!trxId) {

//           throw new Error(
//             "Transaction ID was not received."
//           );

//         }


//         console.log(
//           "Verifying transaction:",
//           trxId
//         );


//         const result =
//           await verifyPayment(trxId);


//         console.log(
//           "Verification response:",
//           result
//         );


//         if (
//           !result?.success
//         ) {

//           throw new Error(
//             result?.message ||
//             "Payment verification failed."
//           );

//         }


//         const verifiedPayment =
//           result?.data;


//         if (
//           verifiedPayment?.status !==
//           "success"
//         ) {

//           throw new Error(
//             "Payment verification was not successful."
//           );

//         }


//         setPayment(
//           verifiedPayment
//         );

//       } catch (error) {

//         console.error(
//           "Verification error:",
//           error
//         );

//         setError(
//           error?.message ||
//           "Payment verification failed."
//         );

//       } finally {

//         setLoading(false);

//       }

//     };


//     verify();

//   }, []);


//   if (loading) {

//     return (
//       <PaymentLayout>

//         <div className="verification-container">

//           <div className="spinner" />

//           <h2>
//             Verifying Transaction
//           </h2>

//           <p>
//             Please wait while we verify
//             your payment.
//           </p>

//         </div>

//       </PaymentLayout>
//     );

//   }


//   if (error) {

//     return (
//       <PaymentLayout>

//         <div className="payment-result failed">

//           <div className="failed-icon">
//             !
//           </div>

//           <h2>
//             Payment Verification Failed
//           </h2>

//           <p>
//             {error}
//           </p>

//         </div>

//       </PaymentLayout>
//     );

//   }


//   return (
//     <PaymentLayout>

//       <div className="payment-result success">

//         <div className="success-icon">
//           ✓
//         </div>


//         <h2>
//           Transaction Verified
//         </h2>


//         <p>
//           Your payment has been
//           successfully verified.
//         </p>


//         <div className="transaction-details">

//           <div className="transaction-row">
//             <span>
//               Transaction ID
//             </span>

//             <strong>
//               {payment?.trx_id}
//             </strong>
//           </div>


//           <div className="transaction-row">
//             <span>
//               Order Reference
//             </span>

//             <strong>
//               {payment?.ref_trx}
//             </strong>
//           </div>


//           <div className="transaction-row">
//             <span>
//               Amount
//             </span>

//             <strong>
//               ₹{payment?.amount}
//             </strong>
//           </div>


//           <div className="transaction-row">
//             <span>
//               Fee
//             </span>

//             <strong>
//               ₹{payment?.fee}
//             </strong>
//           </div>


//           <div className="transaction-row">
//             <span>
//               Net Amount
//             </span>

//             <strong>
//               ₹{payment?.net_amount}
//             </strong>
//           </div>


//           <div className="transaction-row">
//             <span>
//               Customer
//             </span>

//             <strong>
//               {payment?.customer?.name}
//             </strong>
//           </div>


//           <div className="transaction-row">
//             <span>
//               Email
//             </span>

//             <strong>
//               {payment?.customer?.email}
//             </strong>
//           </div>


//           <div className="transaction-row">
//             <span>
//               Status
//             </span>

//             <strong className="verified-status">
//               VERIFIED
//             </strong>
//           </div>

//         </div>

//       </div>

//     </PaymentLayout>
//   );
// };


// export default PaymentSuccess;

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
          "Verifying transaction:",
          trxId
        );


        const result =
          await verifyPayment(
            trxId
          );


        console.log(
          "Verification response:",
          result
        );


        if (
          !result?.success
        ) {

          throw new Error(
            result?.message ||
              "Payment verification failed."
          );

        }


        const verifiedPayment =
          result?.data;


        if (
          !verifiedPayment
        ) {

          throw new Error(
            "Payment details were not received."
          );

        }


        /*
         * Paykar/backend response
         * should contain successful status.
         *
         * Existing frontend expected
         * lowercase "success".
         *
         * Support both formats safely.
         */
        const status =
          String(
            verifiedPayment?.status ||
              ""
          ).toUpperCase();


        if (
          status !== "SUCCESS" &&
          status !== "SUCCESSFUL"
        ) {

          throw new Error(
            "Payment verification was not successful."
          );

        }


        setPayment(
          verifiedPayment
        );

      } catch (error) {

        console.error(
          "Verification error:",
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

          <div className="spinner" />

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


  if (error) {

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
            {error}
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

          <div className="transaction-row">

            <span>
              Transaction ID
            </span>

            <strong>
              {payment?.trx_id ||
                payment?.paykar_transaction_id ||
                "-"}
            </strong>

          </div>


          <div className="transaction-row">

            <span>
              Order Reference
            </span>

            <strong>
              {payment?.ref_trx ||
                payment?.merchant_reference ||
                "-"}
            </strong>

          </div>


          <div className="transaction-row">

            <span>
              Amount
            </span>

            <strong>
              ₹{payment?.amount || "0.00"}
            </strong>

          </div>


          <div className="transaction-row">

            <span>
              Fee
            </span>

            <strong>
              ₹{payment?.fee || "0.00"}
            </strong>

          </div>


          <div className="transaction-row">

            <span>
              Net Amount
            </span>

            <strong>
              ₹{payment?.net_amount || "0.00"}
            </strong>

          </div>


          <div className="transaction-row">

            <span>
              Customer
            </span>

            <strong>
              {payment?.customer?.name ||
                payment?.customerName ||
                "-"}
            </strong>

          </div>


          <div className="transaction-row">

            <span>
              Email
            </span>

            <strong>
              {payment?.customer?.email ||
                payment?.customerEmail ||
                "-"}
            </strong>

          </div>


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