import React, { useState } from "react";
import "./AddCustomer.scss";
import { Button, Modal, Box, TextField, Collapse, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { House } from "lucide-react";

const CustomerData = [
  {
    customerId: 101,
    customerName: "John Doe",
    customerSessionStatus: "Active",
    customerSessionStatusOther: "false",
    runningSessionTime: "00:45:32",
    email: "sample@gmail.com",
    mobileNumber: "+1234567890",
  },
  {
    customerId: 102,
    customerName: "Jane Smith",
    customerSessionStatus: "Inactive",
    customerSessionStatusOther: "true",
    runningSessionTime: "00:00:00",
    email: "jane.smith@example.com",
    mobileNumber: "+1987654321",
  },
  {
    customerId: 103,
    customerName: "Session Tester",
    customerSessionStatus: "true",
    customerSessionStatusOther: "true",
    runningSessionTime: "00:10:00",
    email: "tester@example.com",
    mobileNumber: "+1122334455",
  },
];

const AddCustomer = () => {
  const [input, setInput] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    area: "",
    fullAddress: "",
  });

  const handleSearch = () => {
    const result = CustomerData.find(
      (cust) =>
        cust.mobileNumber === input.trim() ||
        cust.email.toLowerCase() === input.toLowerCase().trim()
    );

    if (result) {
      setFoundCustomer(result);
      setOpenModal(false);
    } else {
      setFoundCustomer(null);
      setForm({
        firstName: "",
        lastName: "",
        email: input.includes("@") ? input : "",
        mobile: input.match(/^\+?[0-9]+$/) ? input : "",
        country: "",
        state: "",
        city: "",
        pincode: "",
        area: "",
        fullAddress: "",
      });
      setOpenModal(true);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleModalSave = () => {
    setOpenModal(false);
    setFoundCustomer({
      customerName: `${form.firstName} ${form.lastName}`,
      ...form,
    });
  };

  return (
    <div className="AddCustomerContainer">
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Add Customer</p>
          <div style={{ display: "flex", gap: "15px" }}>
            <Button
              className="AddCustomer_Btn"
              onClick={() => navigate("/")}
              variant="contained"
            >
              <House />
            </Button>
          </div>
        </div>
      </div>

      <div className="AddCustomer_sub">
        <div className="form-section">
          <TextField
            fullWidth
            label="Enter Email or Mobile Number"
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Save
          </Button>
        </div>

        {foundCustomer && (
          <div className="result-section">
            <h4>Found Customer</h4>
            <p>
              <strong>Name:</strong> {foundCustomer.customerName}
            </p>
            <p>
              <strong>Email:</strong> {foundCustomer.email}
            </p>
            <p>
              <strong>Mobile:</strong>{" "}
              {foundCustomer.mobileNumber || foundCustomer.mobile}
            </p>
          </div>
        )}

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box className="addCustomer_modalbox">
            <h3>Add New Customer</h3>

            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleFormChange}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleFormChange}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleFormChange}
              margin="dense"
            />

            <Link
              component="button"
              variant="body2"
              sx={{ mt: 1, mb: 1 }}
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "Hide Extra Fields" : "Show More"}
            </Link>

            <Collapse in={showMore}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={form.country}
                onChange={handleFormChange}
                margin="dense"
              />
              <TextField
                fullWidth
                label="State"
                name="state"
                value={form.state}
                onChange={handleFormChange}
                margin="dense"
              />
              <TextField
                fullWidth
                label="City"
                name="city"
                value={form.city}
                onChange={handleFormChange}
                margin="dense"
              />
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleFormChange}
                margin="dense"
              />
              <TextField
                fullWidth
                label="Area"
                name="area"
                value={form.area}
                onChange={handleFormChange}
                margin="dense"
              />
              <TextField
                fullWidth
                label="Full Address"
                name="fullAddress"
                value={form.fullAddress}
                onChange={handleFormChange}
                margin="dense"
              />
            </Collapse>

            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleModalSave}
              sx={{ mt: 2 }}
            >
              Save
            </Button>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default AddCustomer;