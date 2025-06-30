import React, { useState } from "react";
import "./AddCustomer.scss";
import {
  Button,
  Modal,
  Box,
  TextField,
  Collapse,
  Typography,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { House, X } from "lucide-react";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import { showToast } from "../../Utils/Tostify/ToastManager";
import { CallApi } from "../../API/CallApi/CallApi";

const AddCustomer = () => {
  const [input, setInput] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
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

  const handleSearch = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError("Mobile or Email is required.");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
    const isMobile = /^\+?[0-9]{10,15}$/.test(trimmedInput);

    if (!isEmail && !isMobile) {
      setError("Please enter a valid mobile number or email.");
      return;
    }

    setError(""); // Clear error

    const Device_Token = sessionStorage.getItem("device_token");
    const VerifyMode = isEmail ? "email" : "mobile";
    const LoginID = trimmedInput;

    const body = {
      Mode: "VerifyEmailMobile",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "VerifyEmailMobile",
          DeviceToken: Device_Token,
          VerifyMode,
          LoginID,
          AppId: 3,
        },
      ]),
    };

    const response = await CallApi(body);
    if (response?.DT[0]?.stat == 1) {
      setForm({
        firstName: "",
        lastName: "",
        email: isEmail ? trimmedInput : "",
        mobile: isMobile ? trimmedInput : "",
        country: "",
        state: "",
        city: "",
        pincode: "",
        area: "",
        fullAddress: "",
      });
      setOpenModal(true);
    } else {
      setInput("");
      showToast({
        message: "Customer Allready Available",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 5000,
      });
      setFoundCustomer(response?.DT[0]);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleModalSave = async () => {
    const errors = {};

    if (!form.firstName.trim()) errors.firstName = "First Name is required";
    if (!form.lastName.trim()) errors.lastName = "Last Name is required";
    if (!form.mobile.trim()) errors.mobile = "Mobile Number is required";
    if (!form.email.trim()) errors.email = "Email is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setLoading(true);

    try {
      const Device_Token = sessionStorage.getItem("device_token");

      const reqData = [
        {
          ForEvt: "CutomerRegister",
          DeviceToken: Device_Token,
          AppId: "3",
          FirstName: form.firstName,
          LastName: form.lastName,
          CustMobile: form.mobile,
          CustEmail: form.email,
          Area: form.area,
          City: form.city,
          State: form.state,
          Country: form.country,
          PinCode: form.pincode,
          Address: form.fullAddress,
        },
      ];

      const body = {
        Mode: "CutomerRegister",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify(reqData),
      };

      const response = await CallApi(body);
      if (response?.DT[0]?.stat == 1) {
        showToast({
          message: "Now Customer OnFloor",
          bgColor: "#4caf50",
          fontColor: "#fff",
          duration: 5000,
        });
        navigate("/JobScanPage");
        setOpenModal(false);
      } else {
        showToast({
          message: response?.DT[0]?.stat_msg,
          bgColor: response?.DT[0]?.stat == 0 ? "red" : "#4caf50",
          fontColor: "#fff",
          duration: 5000,
        });
      }

      setFoundCustomer({
        customerName: `${form.firstName} ${form.lastName}`,
        ...form,
      });
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNaviagte = async () => {
    const Device_Token = sessionStorage.getItem("device_token");
    const body = {
      Mode: "SetCustomerOnFloor",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "SetCustomerOnFloor",
          DeviceToken: Device_Token,
          CustomerId: foundCustomer?.CustomerId,
          AppId: 3,
        },
      ]),
    };
    const response = await CallApi(body);
    if (response?.DT[0]?.stat == 1) {
      showToast({
        message: "Now Customer OnFloor",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 5000,
      });
      sessionStorage.removeItem("AllScanJobData");

      const body = {
        Mode: "StartSession",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify([
          {
            ForEvt: "StartSession",
            DeviceToken: Device_Token,
            CustomerId: foundCustomer?.CustomerId,
            AppId: 3,
          },
        ]),
      };

      const response = await CallApi(body);
      if (response?.DT[0]?.stat == 1) {
        showToast({
          message: "Customer Session Start",
          bgColor: "#4caf50",
          fontColor: "#fff",
          duration: 5000,
        });
        navigate(`/JobScanPage`);
        sessionStorage.setItem(
          "curruntActiveCustomer",
          JSON.stringify(foundCustomer)
        );
      }
    }
  };

  return (
    <div className="AddCustomerContainer">
      <LoadingBackdrop isLoading={loading} />
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p
              style={{ fontSize: "20px", textAlign: "center", fontWeight: 600 }}
            >
              Welcome To NIC
            </p>
            <p style={{ fontSize: "16px", textAlign: "center", margin: "0px" }}>
              We are happy to have you here. Register here to get in touch with
              us.
            </p>
          </div>

          <div style={{ marginTop: "30px" }}>
            <p style={{ margin: "0px", fontSize: "14px", fontWeight: 600 }}>
              Pleese Enter Valid Mobile Or Email
            </p>
            <TextField
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(""); // remove error on typing
              }}
              error={!!error}
              helperText={error}
            />
          </div>
          <Button className="addFormBtn" onClick={handleSearch}>
            Save
          </Button>
        </div>

        {foundCustomer && (
          <div className="result-section">
            <h4>Available Customer</h4>

            <Button
              className="customercard_button"
              onClick={() => handleNaviagte(foundCustomer)}
            >
              <div className="card-header">
                <div>
                  <h5>
                    {foundCustomer.firstname} {foundCustomer?.lastname}
                  </h5>
                  <p className="text-muted">
                    <strong>Customer Code:</strong> {foundCustomer.customercode}
                  </p>
                  <p className="text-muted">Mobile: {foundCustomer.mobileno}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: "10px", color: "#b5aeae" }}>
                  Click To Select
                </p>
              </div>
            </Button>
          </div>
        )}

        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          style={{ outline: "none" }}
        >
          <Box className="addCustomer_modalbox">
            <p style={{ fontSize: "19px", fontWeight: 600 }}>
              Add New Customer
            </p>
            <Button
              onClick={() => setOpenModal(false)}
              style={{
                position: "absolute",
                right: "15px",
                top: "10px",
                color: "black",
                margin: "0px",
                padding: "0px",
                minWidth: "25px",
                height: "25px",
                border: '1px solid black',
                borderRadius: '20px'
              }}
            >
              <X />
            </Button>

            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleFormChange}
              margin="dense"
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
            />

            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleFormChange}
              margin="dense"
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              margin="dense"
              error={!!formErrors.email}
              helperText={formErrors.email}
            />

            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleFormChange}
              margin="dense"
              error={!!formErrors.mobile}
              helperText={formErrors.mobile}
            />

            {!showMore && (
              <Link
                component="button"
                variant="body2"
                sx={{ mt: 1, mb: 1 }}
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Hide Extra Fields" : "Show More"}
              </Link>
            )}

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

            {showMore && (
              <Link
                component="button"
                variant="body2"
                sx={{ mt: 1, mb: 1 }}
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Hide Extra Fields" : "Show More"}
              </Link>
            )}

            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleModalSave}
              sx={{ mt: 2 }}
              className="addFormBtn"
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
