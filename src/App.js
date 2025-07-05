import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoadingBackdrop from "./Utils/LoadingBackdrop";
import Profile from "./components/ProfilePage/Profile";
import { ToastContainer } from "./Utils/Tostify/ToastManager";
import OrderSuccess from "./Page/OrderSucess/OrderSuccess";
import Support from "./components/Support/Support";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy";
import Register from "./components/Register/Register";
import FeedBack from "./components/FeedBack/FeedBack";

const Customer = lazy(() => import("./components/Customer/Customer"));
const AddCustomer = lazy(() => import("./components/AddCustomer/AddCustomer"));
const JobScanPage = lazy(() => import("./components/JobScanPage/JobScanPage"));

function App() {
  //  http://localhost:3000/?&device_token=63J1UX1513PBL6KM 
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const device_token = queryParams.get("device_token");
    const token = queryParams.get("token");
    const SV = queryParams.get("SV");

    if (device_token !== undefined && device_token !== null) {
      sessionStorage.setItem("device_token", device_token);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("SV", SV);
      sessionStorage.setItem("isLogin", true);
    }
  }, []);

  return (
    <BrowserRouter >
      <ToastContainer />
      <Suspense fallback={<LoadingBackdrop />}>
        <Routes>
          <Route path="/" element={<Customer />} />
          <Route path="/AddCustomer" element={<AddCustomer />} />
          <Route path="/JobScanPage" element={<JobScanPage />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/orderSuccess" element={<OrderSuccess />} />
          <Route path="/Support" element={<Support />} />
          <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feedback" element={<FeedBack />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
export default App;

//basename="/evo"
//"homepage": "/evo",
