// const PaymentLayout = ({
//   children,
// }) => {
//   return (
//     <div className="payment-page">
//       <div className="payment-card">

//         <div className="payment-header">

//           <h1>
//             Alina Overseas
//           </h1>

//           <div className="secure-badge">
//             Secure Payment
//           </div>

//         </div>

//         <div className="payment-body">
//           {children}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default PaymentLayout;

const formatVendorName = (
  vendorSlug
) => {

  if (!vendorSlug) {
    return "Paykar";
  }


  return vendorSlug
    .split("-")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");

};


const PaymentLayout = ({
  children,
}) => {

  const pathname =
    window.location.pathname;


  const vendorSlug =
    pathname
      .split("/")
      .filter(Boolean)[0] || "";


  const vendorName =
    formatVendorName(
      decodeURIComponent(
        vendorSlug
      )
    );


  return (
    <div className="payment-page">

      <div className="payment-card">

        <div className="payment-header">

          <h1>
            {vendorName}
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