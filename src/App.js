import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Customer from "./components/Customer/Customer";
import AddCustomer from "./components/AddCustomer/AddCustomer";
import JobScanPage from "./components/JobScanPage/JobScanPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Customer />} />
          <Route path="/AddCustomer" element={<AddCustomer />} />
          <Route path="/JobScanPage" element={<JobScanPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

// basename="/evo"