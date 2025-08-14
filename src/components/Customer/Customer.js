import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineClockCircle,
  AiOutlineCloseCircle,
  AiOutlineDown,
  AiOutlineLock,
  AiOutlineRight,
  AiOutlineUp,
} from "react-icons/ai";
import { CallApi } from "../../API/CallApi/CallApi";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import {
  AlignJustify,
  CirclePlus,
  CircleUser,
  Plus,
  RotateCcw,
} from "lucide-react";
import { showToast } from "../../Utils/Tostify/ToastManager";
import CustomAvatar from "../../Utils/avatar";
import logo from "../../assests/80-40.png";
import Cookies from "js-cookie";

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

const styleEndBox = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
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
  const [endReleseCust, setEndReleseCust] = useState();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [tabsFixed, setTabsFixed] = useState(false);
  const headerRef = useRef(null);
  const [allProfileData, setAllProfileData] = useState();
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const cardRefs = useRef({});
  const expandedSectionRefs = useRef({});
  const navigate = useNavigate();

  const GetProfileData = async () => {
    const Device_Token = sessionStorage.getItem("device_token");

    const body = {
      Mode: "GetProfileData",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "GetProfileData",
          DeviceToken: Device_Token,
          AppId: 3,
        },
      ]),
    };

    const response = await CallApi(body);
    if (response?.DT[0]?.stat == 1) {
      setAllProfileData(response.DT[0]);
      sessionStorage.setItem("profileData", JSON.stringify(response.DT[0]));
    }
  };

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

    const storedProfileData = sessionStorage.getItem("profileData");
    if (storedProfileData) {
      setAllProfileData(JSON.parse(storedProfileData));
    } else {
      GetProfileData();
    }
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

  const toggleExpand = (customerId) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(customerId);

      setTimeout(() => {
        const card = cardRefs.current[customerId];
        const expanded = expandedSectionRefs.current[customerId];

        if (!card || !expanded) return;

        const cardRect = card.getBoundingClientRect();
        const expandRect = expanded.getBoundingClientRect();

        const isFullyVisible =
          expandRect.top >= 0 && expandRect.bottom <= window.innerHeight;

        if (!isFullyVisible) {
          const scrollOffset = expandRect.bottom - window.innerHeight + 20;
          window.scrollBy({
            top: scrollOffset,
            behavior: "smooth",
          });
        }
      }, 200);
    }
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenMenu(newOpen);
  };

  const HandleDeleteAccountOpen = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

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

  const sortedData = useMemo(() => {
    if (!filteredData) return [];
    return [...filteredData].sort((a, b) => {
      if (a.IsLockTimer === 2) return -1;
      if (b.IsLockTimer === 2) return 1;
      return 0;
    });
  }, [filteredData]);

  useEffect(() => {
    const runningCustomer = filteredData?.find(
      (cust) => cust.IsLockTimer === 2
    );
    if (runningCustomer) {
      setExpandedCustomerId(runningCustomer.CustomerId);
    } else {
      setExpandedCustomerId(null);
    }
  }, [filteredData]);

  const handleClickStatus = async (customer) => {
    if (customer?.IsLockTimer == 1) {
      showToast({
        message: "Allready In Session",
        bgColor: "#f44336",
        fontColor: "#fff",
        duration: 3000,
      });
      return;
    }

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
            IsVisitor: customer?.IsVisitor,
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

  const handleExitCustomer = async (customer, endCustomer) => {
    const Device_Token = sessionStorage.getItem("device_token");

    if (endCustomer) {
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
        sessionStorage.removeItem("AllScanJobData");
        // navigate("/feedback");
        GetCustomerData();
      }
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
          sessionStorage.removeItem("AllScanJobData");
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
          // navigate("/feedback");
          GetCustomerData();
        }
        setOpen(false);
      }
    }
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
  }, []);

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <div className="header_top_profile">
        <img
          skin="light"
          color="success"
          variant="rounded"
          style={{ width: 42, height: 42, borderRadius: 50 }}
          src={
            allProfileData?.ImagePath ||
            "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
          }
        />
        <div>
          <p style={{ margin: "0px", fontWeight: 600, fontSize: "14px" }}>
            {allProfileData?.firstname} {allProfileData?.lastname}
          </p>
          <p style={{ margin: "-2px 0px 0px 0px", fontSize: "12px" }}>
            {allProfileData?.userid}
          </p>
          <p style={{ margin: "-2px 0px 0px 0px", fontSize: "12px" }}>
            {allProfileData?.CompanyCode}
          </p>
        </div>
      </div>
      <Accordion
        className="HeaderMenu_accordion"
        onClick={() => navigate("/support")}
      >
        <ListItemButton>
          <Typography className="HeaderMenu_Without_Sub">Support</Typography>
        </ListItemButton>
      </Accordion>

      <Accordion
        className="HeaderMenu_accordion"
        onClick={() => navigate("/PrivacyPolicy")}
      >
        <ListItemButton>
          <Typography className="HeaderMenu_Without_Sub">
            Privacy Policy
          </Typography>
        </ListItemButton>
      </Accordion>

      <div>
        <p
          onClick={handleLogoutClick}
          style={{
            margin: "15px",
            textDecoration: "underline",
            color: "blue",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Logout
        </p>
      </div>

      <div>
        <p
          onClick={HandleDeleteAccountOpen}
          style={{
            margin: "15px",
            textDecoration: "underline",
            color: "blue",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Delete My Account
        </p>
      </div>
    </Box>
  );

  const handleLogoutConfirm = () => {
    navigate("/logout", { replace: true });
    setOpenLogoutDialog(false);
    sessionStorage.clear();
    Cookies.remove("device_token");
    Cookies.remove("token");
    Cookies.remove("SV");
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  const HandleDeleteAccount = async () => {
    window.history.pushState({}, "", "/account-delete");
    sessionStorage.clear();
    window.location.reload();
    // navigate("/account-delete", { replace: true });
  };

  return (
    <div className="CustomerMain">
      <LoadingBackdrop isLoading={loading} />
      <Drawer open={openMenu} onClose={() => setOpenMenu(false)}>
        {DrawerList}
      </Drawer>

      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-confirmation-dialog"
      >
        <DialogTitle id="logout-confirmation-dialog">
          Are you sure you want to logout?
        </DialogTitle>
        <DialogActions style={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleLogoutCancel}
            className="Account_delete_button"
          >
            No
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            className="Account_delete_button"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleEndBox}>
          <div>
            <p
              style={{
                textAlign: "center",
                fontWeight: 600,
                fontSize: "20px",
                paddingBottom: "8px",
              }}
            >
              {endReleseCust == "releseCustomer"
                ? "Exit Customer"
                : "End Session"}
            </p>
          </div>
          <div>
            <p style={{ textAlign: "center" }}>
              {endReleseCust == "releseCustomer"
                ? "Confirm exit? Customer will be removed from list."
                : "Do you want to end this customer’s session? Customer stays in available in list."}
            </p>
          </div>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            className="action-buttons"
            style={{ display: "flex", gap: "5px", margin: "15px 0px 0px 0px" }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setOpen(false);
              }}
              style={{ width: "50%", margin: "0px", fontSize: "12px" }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              style={{
                width: "50%",
                margin: "0px",
                fontSize: "12px",
                padding: "0px",
                backgroundColor: "#932e99",
                color: "white",
                border: "none",
              }}
              onClick={() => {
                if (endReleseCust === "releseCustomer") {
                  handleExitCustomer(endCustomnerInfo, false);
                } else {
                  handleExitCustomer(endCustomnerInfo, true);
                }
              }}
            >
              {endReleseCust == "releseCustomer"
                ? "Yes, Exit Customer"
                : "Yes, End Session"}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
        <DialogActions style={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleDeleteCancel}
            className="Account_delete_button"
          >
            Cancel
          </Button>
          <Button
            onClick={HandleDeleteAccount}
            autoFocus
            className="Account_delete_button"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <div className="Header_main" ref={headerRef}>
        <div className="header-container">
          <div style={{ width: "33%" }}>
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
              paddingRight: "7px",
            }}
          >
            <Button
              className="AddCustomer_Btn"
              onClick={handleNaviagte}
              variant="contained"
            >
              <Plus />
            </Button>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "60px 16px 4px 10px",
          boxShadow:
            "rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p style={{ fontSize: "17px", color: "#783eb5", fontWeight: 600 }}>
          Customer List
        </p>
        <Button
          className="AddCustomer_refresh_Btn"
          onClick={GetCustomerData}
          variant="contained"
        >
          <RotateCcw />
        </Button>
      </div>

      {!loading &&
        (filteredData?.length !== 0 ? (
          <div className="CustomerContainer">
            <div className="CustomerList">
              {sortedData?.map((cust, i) => {
                const isExpanded = expandedCustomerId === cust.CustomerId;
                return (
                  <div
                    key={i}
                    className="customercard_button"
                    ref={(el) => (cardRefs.current[cust.CustomerId] = el)}
                    onClick={(e) => {
                      // navigate(`/JobScanPage`);
                      const button = e.currentTarget;
                      const circle = document.createElement("span");
                      const diameter = Math.max(
                        button.clientWidth,
                        button.clientHeight
                      );
                      const radius = diameter / 2;

                      circle.style.width =
                        circle.style.height = `${diameter}px`;
                      circle.style.left = `${
                        e.clientX - button.offsetLeft - radius
                      }px`;
                      circle.style.top = `${
                        e.clientY - button.offsetTop - radius
                      }px`;
                      circle.classList.add("ripple");

                      // Remove old ripple if exists
                      const ripple = button.getElementsByClassName("ripple")[0];
                      if (ripple) {
                        ripple.remove();
                      }

                      button.appendChild(circle);

                      if (cust.IsLockTimer === 0 || cust.IsLockTimer === 2) {
                        toggleExpand(cust.CustomerId);
                      } else {
                        handleClickStatus(cust);
                      }
                    }}
                    style={{
                      backgroundColor: cust.IsLockTimer === 2 && "#e4f0df",
                    }}
                  >
                    <div className="card-header">
                      <div>
                        <h5>{`${cust.firstname} ${cust.lastname}`}</h5>
                        <p className="text-muted">{cust.contactNumber}</p>
                      </div>

                      <div className="status-badge-container">
                        {cust.IsLockTimer === 0 && (
                          <div className="status-row">
                            <span className="dot available" />
                          </div>
                        )}

                        {cust.IsLockTimer === 1 && (
                          <span className="status-badge in-session">
                            <AiOutlineLock style={{ marginRight: "5px" }} />
                            In Session
                          </span>
                        )}

                        {cust.IsLockTimer === 2 && (
                          <div
                            className="status-row"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                            }}
                          >
                            <span
                              className="expand-icon"
                              onClick={() => handleClickStatus(cust)}
                              style={{
                                padding: "4px",
                                borderRadius: "3px",
                                width: "30px",
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <AiOutlineRight color="black" />
                            </span>
                            <span className="timer-text">
                              <AiOutlineClockCircle />
                              {formatSecondsToTime(
                                timers[cust.CustomerId] ?? 0
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      ref={(el) =>
                        (expandedSectionRefs.current[cust.CustomerId] = el)
                      }
                      className={`expand-wrapper ${isExpanded ? "show" : ""}`}
                    >
                      {cust.IsLockTimer === 0 && (
                        <div className="expand-actions">
                          <Button
                            size="small"
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStop(cust);
                              setEndReleseCust("releseCustomer");
                            }}
                            style={{
                              color: "white",
                              backgroundColor: "#811bdb",
                            }}
                          >
                            Remove Customer
                          </Button>

                          <Button
                            size="small"
                            type="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClickStatus(cust);
                            }}
                            style={{
                              color: "white",
                              backgroundColor: "#811bdb",
                            }}
                          >
                            Start Session
                          </Button>
                        </div>
                      )}

                      {cust.IsLockTimer === 2 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          {!stopped[cust.CustomerId] && (
                            <Button
                              size="small"
                              danger
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStop(cust);
                                setEndReleseCust("endCustomer");
                              }}
                              style={{
                                color: "white",
                                backgroundColor: "#811bdb",
                              }}
                            >
                              End Customer
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
        ))}
    </div>
  );
};

export default Customer;
