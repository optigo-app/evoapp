import React, { useEffect, useRef, useState } from "react";
import "./Customer.scss";
import {
  Button,
  Drawer,
  Box,
  Typography,
  Stack,
  Modal,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemText,
  List,
  Divider,
  Accordion,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AiOutlineCloseCircle, AiOutlineLock } from "react-icons/ai";
import { CallApi } from "../../API/CallApi/CallApi";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import { AlignJustify, CirclePlus, CircleUser } from "lucide-react";
import { showToast } from "../../Utils/Tostify/ToastManager";
import CustomAvatar from "../../Utils/avatar";
import logo from "../../assests/Evo sale app (1).png";

const formatSecondsToTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  height: "auto",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 3,
  maxHeight: "90vh",
  overflowY: "auto",
};
const Customer = () => {
  const [mainData, setMainData] = useState([]);
  const [result, setResult] = useState([]);
  const [search, setSearch] = useState("");
  const [timers, setTimers] = useState({});
  const [stopped, setStopped] = useState({});
  const [endCustomnerInfo, setEndCustomerInfo] = useState();
  const [loading, setLoading] = useState(false);
  const [customerEnd, setCustomerEnd] = useState(false);
  const [openFeedback, setOpenFeedBack] = React.useState(false);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [tabsFixed, setTabsFixed] = useState(false);
  const headerRef = useRef(null);
  const [allProfileData, setAllProfileData] = useState();
  const handleCloseFeedBack = () => setOpenFeedBack(false);

  const toggleDrawer = (newOpen) => () => {
    setOpenMenu(newOpen);
  };

  const navigate = useNavigate();

  const GetCustomerData = async () => {
    setLoading(true);
    const Device_Token = sessionStorage.getItem("device_token");

    const body = {
      Mode: "GetCustomerData",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "GetCustomerData",
          DeviceToken: Device_Token,
          AppId: 3,
        },
      ]),
    };

    const response = await CallApi(body);
    setMainData(response?.DT || []);
    setLoading(false);
  };

  useEffect(() => {
    GetCustomerData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        mainData.forEach((cust) => {
          if (cust.IsLockTimer === 2 && !stopped[cust.CustomerId]) {
            const start = new Date(cust.StartDateTime).getTime();
            const now = Date.now();
            const diffSeconds = Math.floor((now - start) / 1000);
            updated[cust.CustomerId] = Math.max(0, diffSeconds);
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mainData, stopped]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const filtered = mainData.filter((item) =>
        item.firstname.toLowerCase().includes(search.toLowerCase())
      );
      setResult(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setResult([]);
  };

  const filteredData = result.length > 0 ? result : mainData;
  const handleClickStatus = async (customer) => {
    const isOtherRunning = mainData.some(
      (cust) =>
        cust.CustomerId !== customer.CustomerId &&
        cust.IsLockTimer === 2 &&
        !stopped[cust.CustomerId]
    );
    if (isOtherRunning) {
      showToast({
        message: "First End The Running Customer",
        bgColor: "#f44336",
        fontColor: "#fff",
        duration: 3000,
      });
      return;
    }
    if (customer.IsLockTimer === 0) {
      const Device_Token = sessionStorage.getItem("device_token");
      const body = {
        Mode: "StartSession",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify([
          {
            ForEvt: "StartSession",
            DeviceToken: Device_Token,
            CustomerId: customer?.CustomerId,
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
          JSON.stringify(customer)
        );
      } else {
      }
    } else if (customer.IsLockTimer === 2) {
      navigate(`/JobScanPage`);
      sessionStorage.setItem("curruntActiveCustomer", JSON.stringify(customer));
    }
  };

  const handleStop = async (customer) => {
    setOpen(true);
    setEndCustomerInfo(customer);
  };

  const handleExitCustomer = async (customer) => {
    const Device_Token = sessionStorage.getItem("device_token");
    if (customerEnd) {
      const body = {
        Mode: "EndSession",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify([
          {
            ForEvt: "EndSession",
            DeviceToken: Device_Token,
            CustomerId: customer?.CustomerId,
            IsVisitor: customer?.IsVisitor,
            AppId: 3,
          },
        ]),
      };

      const response = await CallApi(body);
      if (response?.DT[0]?.stat == 1) {
        setStopped((prev) => ({ ...prev, [customer?.CustomerId]: true }));
        showToast({
          message: "Customer Session End",
          bgColor: "#4caf50",
          fontColor: "#fff",
          duration: 5000,
        });
      }
      setOpenFeedBack(false);
      setOpen(false);
    } else {
      const endSessionBody = {
        Mode: "EndSession",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify([
          {
            ForEvt: "EndSession",
            DeviceToken: Device_Token,
            CustomerId: endCustomnerInfo?.CustomerId,
            IsVisitor: endCustomnerInfo?.IsVisitor,
            AppId: 3,
          },
        ]),
      };

      const endSessionResponse = await CallApi(endSessionBody);

      if (endSessionResponse?.DT[0]?.stat == 1) {
        setStopped((prev) => ({
          ...prev,
          [endCustomnerInfo?.CustomerId]: true,
        }));
        showToast({
          message: "Customer Session End",
          bgColor: "#4caf50",
          fontColor: "#fff",
          duration: 3000,
        });

        // Step 2: Now call ExitCustomer
        const exitBody = {
          Mode: "ExitCustomer",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "ExitCustomer",
              DeviceToken: Device_Token,
              CustomerId: endCustomnerInfo?.CustomerId,
              IsVisitor: endCustomnerInfo?.IsVisitor,
              AppId: 3,
            },
          ]),
        };

        const exitResponse = await CallApi(exitBody);

        if (exitResponse?.DT[0]?.stat == 1) {
          setStopped((prev) => ({
            ...prev,
            [endCustomnerInfo?.CustomerId]: true,
          }));
          showToast({
            message: "Customer Exit Completed",
            bgColor: "#4caf50",
            fontColor: "#fff",
            duration: 5000,
          });
        }
        setOpenFeedBack(false);
        setOpen(false);
      }
    }
  };

  const renderStatus = (cust) => {
    if (cust.IsLockTimer === 0) {
      return <span className="status-badge available">Available</span>;
    }

    if (cust.IsLockTimer === 1) {
      return (
        <span className="status-badge in-session">
          <AiOutlineLock style={{ marginRight: "5px" }} />
          In Session
        </span>
      );
    }

    if (cust.IsLockTimer === 2) {
      const seconds = timers[cust.CustomerId] ?? 0;
      return (
        <span
          className="status-badge active-timer"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div>
            {formatSecondsToTime(seconds)}
            {!stopped[cust.CustomerId] && (
              <Button
                size="small"
                style={{
                  marginLeft: "10px",
                  backgroundColor: "red",
                  color: "white",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStop(cust);
                }}
              >
                End
              </Button>
            )}
          </div>
        </span>
      );
    }

    return null;
  };

  const isAnyRunning = mainData.some(
    (cust) => cust.IsLockTimer === 2 && !stopped[cust.CustomerId]
  );
  const handleNaviagte = () => {
    if (isAnyRunning) {
      showToast({
        message: "First End The Running Customer",
        bgColor: "#f44336",
        fontColor: "#fff",
        duration: 5000,
      });
      return;
    }
    navigate("/AddCustomer");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const headerBottom = headerRef.current.getBoundingClientRect().bottom;
      setTabsFixed(headerBottom <= 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedProfileData = sessionStorage.getItem("profileData");
    if (storedProfileData) {
      setAllProfileData(JSON.parse(storedProfileData));
    }
  }, [open]);

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <div className="header_top_profile">
        <CustomAvatar
          skin="light"
          color="success"
          variant="rounded"
          sx={{ width: 42, height: 42, borderRadius: 50 }}
          src={
            allProfileData?.ImagePath ||
            "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
          }
        ></CustomAvatar>
        <div>
          <p style={{ margin: "0px", fontWeight: 600, fontSize: "14px" }}>
            {allProfileData?.firstname} {allProfileData?.lastname}
          </p>
          <p style={{ margin: "-2px 0px 0px 0px", fontSize: "12px" }}>
            {allProfileData?.userid}
          </p>
        </div>
      </div>
      <Accordion className="HeaderMenu_accordion" onClick={() => navigate('/support')}>
        <ListItemButton>
          <Typography className="HeaderMenu_Without_Sub">Support</Typography>
        </ListItemButton>
      </Accordion>

      <Accordion className="HeaderMenu_accordion" onClick={() => navigate('/PrivacyPolicy')}>
        <ListItemButton>
          <Typography className="HeaderMenu_Without_Sub">
            Privacy Policy
          </Typography>
        </ListItemButton>
      </Accordion>
    </Box>
  );

  return (
    <div className="CustomerMain">
      <LoadingBackdrop isLoading={loading} />
      <Modal
        open={openFeedback}
        onClose={handleCloseFeedBack}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Give Feedback
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="feedback-select-label">Service</InputLabel>
            <Select labelId="feedback-select-label" label="Feedback">
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="average">Average</MenuItem>
              <MenuItem value="bad">Bad</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="feedback-select-label">Support</InputLabel>
            <Select labelId="feedback-select-label" label="Feedback">
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="average">Average</MenuItem>
              <MenuItem value="bad">Bad</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="feedback-select-label">Help</InputLabel>
            <Select labelId="feedback-select-label" label="Feedback">
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="average">Average</MenuItem>
              <MenuItem value="bad">Bad</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={handleCloseFeedBack}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleExitCustomer(endCustomnerInfo)}
              style={{ 
                backgroundColor: '',
                fontSize: '12px',
                margin: '0px',
                padding: '8px'
              }}
            >
              {customerEnd ? "Save & End Customer" : "Save & Relese Customer"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Drawer open={openMenu} onClose={() => setOpenMenu(false)}>
        {DrawerList}
      </Drawer>

      <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)}>
        <Box className="Customer_bottom_button">
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            className="action-buttons"
          >
            <Button
              variant="outlined"
              onClick={() => {
                setOpenFeedBack(true);
                setCustomerEnd(false);
              }}
            >
              Relese Customer
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenFeedBack(true);
                setCustomerEnd(true);
              }}
            >
              End Customer
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <div className="Header_main" ref={headerRef}>
        <div className="header-container">
          <div style={{ width: "28%" }}>
            <Button
              className="AddCustomer_Btn"
              onClick={() => setOpenMenu(true)}
              variant="contained"
              style={{ backgroundColor: "transparent", color: "white" }}
            >
              <AlignJustify />
            </Button>
          </div>
          <div
            style={{
              width: "33.33%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img src={logo} style={{ maxWidth: "70px" }} />
          </div>
          <div
            style={{
              display: "flex",
              gap: "3px",
              width: "33.33%",
              justifyContent: "flex-end",
            }}
          >
            <Button
              className="AddCustomer_Btn"
              onClick={handleNaviagte}
              variant="contained"
            >
              <CirclePlus />
            </Button>
            <Button
              className="AddCustomer_Btn"
              onClick={() => navigate("/Profile")}
              variant="contained"
            >
              <CircleUser />
            </Button>
          </div>
        </div>
      </div>

      {/* <div className={`Customer_Title_container ${tabsFixed ? "fixed" : ""}`}>
        <p className="header_title">Customer</p>
        <div style={{ display: "flex", gap: "15px" }}>
          <Button
            className="AddCustomer_Btn"
            onClick={handleNaviagte}
            variant="contained"
          >
            <CirclePlus />
          </Button>
        </div>
      </div> */}
      <div className={`Customer_Title_container ${tabsFixed ? "fixed" : ""}`}>
        <div className="CustomerSearch">
          <div className="search-box">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Filter By Customer Name"
            />
            {search && (
              <AiOutlineCloseCircle
                className="clear-icon"
                onClick={handleClearSearch}
              />
            )}
          </div>
        </div>
      </div>
      
      {filteredData?.length !== 0 ? (
        <div className="CustomerContainer">
          <div className="CustomerList">
            {filteredData.map((e, i) => (
              <Button
                key={i}
                className="customercard_button"
                onClick={() => handleClickStatus(e)}
              >
                <div className="card-header">
                  <div>
                    <h5>{`${e.firstname} ${e.lastname}`}</h5>
                    <p className="text-muted">{e.email}</p>
                    <p className="text-muted">{e.contactNumber}</p>
                  </div>
                  <div className="status-badge-container">
                    {renderStatus(e)}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            height: "80vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h6 class="MuiTypography-root MuiTypography-h6 css-32t4mj-MuiTypography-root">
            No Customer Available{" "}
          </h6>
        </div>
      )}
    </div>
  );
};

export default Customer;
