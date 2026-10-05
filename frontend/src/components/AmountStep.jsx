// const AmountStep = ({
//   amount,
//   error,
//   loadingPayment,
//   onAmountChange,
//   onPayment,
// }) => {

//   return (
//     <>

//       <div className="form-group">

//         <label>
//           Amount
//         </label>

//         <div className="amount-wrapper">

//           <span className="currency-symbol">
//             ₹
//           </span>

//           <input
//             type="text"
//             inputMode="decimal"
//             placeholder="0.00"
//             value={amount}
//             onChange={onAmountChange}
//             autoFocus
//             disabled={loadingPayment}
//           />

//         </div>

//         <div className="amount-help">
//           Maximum amount is ₹50,000.
//         </div>

//       </div>


//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}


//       <button
//         type="button"
//         className="payment-button"
//         onClick={() =>
//           onPayment(amount)
//         }
//         disabled={
//           loadingPayment ||
//           !amount ||
//           Number(amount) <= 0
//         }
//       >
//         {loadingPayment
//           ? "Processing..."
//           : "Pay"}
//       </button>

//     </>
//   );
// };

// export default AmountStep;

const AmountStep = ({
  amount,
  error,
  loadingPayment,
  onAmountChange,
  onPayment,
}) => {

  return (
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
              onAmountChange
            }
            autoFocus
            disabled={
              loadingPayment
            }
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
          onPayment(amount)
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

    </>
  );

};


export default AmountStep;