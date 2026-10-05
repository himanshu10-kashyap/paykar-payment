// import PaymentLayout from "./PaymentLayout";

// const LoadingScreen = ({
//   message = "Please wait..."
// }) => {
//   return (
//     <PaymentLayout>

//       <div className="loading-container">

//         <div className="spinner"></div>

//         <p>
//           {message}
//         </p>

//       </div>

//     </PaymentLayout>
//   );
// };

// export default LoadingScreen;

import PaymentLayout from "./PaymentLayout";


const LoadingScreen = ({
  message = "Please wait...",
}) => {

  return (
    <PaymentLayout>

      <div className="loading-container">

        <div className="spinner"></div>


        <p>
          {message}
        </p>

      </div>

    </PaymentLayout>
  );

};


export default LoadingScreen;