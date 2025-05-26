import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Customer from "./components/Customer/Customer";
import AddCustomer from "./components/AddCustomer/AddCustomer";
import CartPage from "./Page/Cart/CartPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Customer />} />
          <Route path="/AddCustomer" element={<AddCustomer />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

// basename="/evo"