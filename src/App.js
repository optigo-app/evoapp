import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoadingBackdrop from "./Utils/LoadingBackdrop";

// Lazy-loaded components
const Customer = lazy(() => import("./components/Customer/Customer"));
const AddCustomer = lazy(() => import("./components/AddCustomer/AddCustomer"));
const JobScanPage = lazy(() => import("./components/JobScanPage/JobScanPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingBackdrop />}>
        <Routes>
          <Route path="/" element={<Customer />} />
          <Route path="/AddCustomer" element={<AddCustomer />} />
          <Route path="/JobScanPage" element={<JobScanPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

// basename="/evo"
