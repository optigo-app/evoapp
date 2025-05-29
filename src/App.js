import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoadingBackdrop from "./Utils/LoadingBackdrop";
import Profile from "./components/ProfilePage/Profile";

const Customer = lazy(() => import("./components/Customer/Customer"));
const AddCustomer = lazy(() => import("./components/AddCustomer/AddCustomer"));
const JobScanPage = lazy(() => import("./components/JobScanPage/JobScanPage"));

function App() {
  // http://localhost:3000/JobScanPage?&device_token=QI0UDSA040V7T7R3
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const device_token = queryParams.get("device_token");
    const token = queryParams.get("token");
    const SV = queryParams.get("SV");

    // if (device_token !== undefined && SV !== null && token !== null) {
    //   sessionStorage.setItem("device_token", device_token);
    //   sessionStorage.setItem("token", token);
    //   sessionStorage.setItem("SV", SV);
    //   sessionStorage.setItem("isLogin", true);
    // }
    if (device_token !== undefined) {
      sessionStorage.setItem("device_token", device_token);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("SV", SV);
      sessionStorage.setItem("isLogin", true);
    }
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingBackdrop />}> 
        <Routes>
          <Route path="/" element={<Customer />} />
          <Route path="/AddCustomer" element={<AddCustomer />} />
          <Route path="/JobScanPage" element={<JobScanPage />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

// basename="/evo"
