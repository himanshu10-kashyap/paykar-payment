// const CustomerStep = ({
//   customer,
//   error,
//   onNext,
// }) => {

//   return (
//     <>
//       <div className="form-group">

//         <label>
//           Customer Name
//         </label>

//         <input
//           type="text"
//           value={
//             customer?.customerName || ""
//           }
//           readOnly
//         />

//       </div>


//       <div className="form-group">

//         <label>
//           Email Address
//         </label>

//         <input
//           type="email"
//           value={
//             customer?.customerEmail || ""
//           }
//           readOnly
//         />

//       </div>


//       <div className="form-group">

//         <label>
//           Mobile Number
//         </label>

//         <input
//           type="text"
//           value={
//             customer?.customerMobile || ""
//           }
//           readOnly
//         />

//       </div>


//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}


//       <button
//         type="button"
//         className="payment-button"
//         onClick={onNext}
//         disabled={!customer}
//       >
//         Next
//       </button>
//     </>
//   );
// };

// export default CustomerStep;

const CustomerStep = ({
  customer,
  error,
  onNext,
}) => {

  return (
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
        onClick={onNext}
        disabled={!customer}
      >
        Next
      </button>

    </>
  );

};


export default CustomerStep;