import React, { useEffect, useState } from "react";
import "./Customer.scss";
import { Button, Drawer, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AiOutlineCloseCircle, AiOutlineLock } from "react-icons/ai";
import { CallApi } from "../../API/CallApi/CallApi";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import { CirclePlus, CircleUser } from "lucide-react";
import { showToast } from "../../Utils/Tostify/ToastManager";

const formatSecondsToTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const Customer = () => {
  const [mainData, setMainData] = useState([]);
  const [result, setResult] = useState([]);
  const [search, setSearch] = useState("");
  const [timers, setTimers] = useState({});
  const [stopped, setStopped] = useState({});
  const [endCustomnerInfo, setEndCustomerInfo] = useState();
  const [loading, setLoading] = useState(false);
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
        sessionStorage.setItem('curruntActiveCustomer' , JSON.stringify(customer))
      } else {
      }
    } else if (customer.IsLockTimer === 2) {
      navigate(`/JobScanPage`);
      sessionStorage.setItem('curruntActiveCustomer' , JSON.stringify(customer))
    }
  };

  const handleStop = async (customer) => {
    setEndCustomerInfo(customer);
    const Device_Token = sessionStorage.getItem("device_token");
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
      setOpen(true);
    } else {
    }
  };

  const handleExitCustomer = async () => {
    const Device_Token = sessionStorage.getItem("device_token");
    const body = {
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

    const response = await CallApi(body);
    if (response?.DT[0]?.stat == 1) {
      setStopped((prev) => ({ ...prev, [endCustomnerInfo?.CustomerId]: true }));
      showToast({
        message: "Customer Session End",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 5000,
      });
      setOpen(true);
    } else {
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

  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleNaviagte = () => {
    const isAnyRunning = mainData.some(
      (cust) => cust.IsLockTimer === 2 && !stopped[cust.CustomerId]
    );
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
  
  return (
    <div className="CustomerMain">
      <LoadingBackdrop isLoading={loading} />

      <Drawer anchor="bottom" open={open} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            height: 200,
            padding: 2,
            backgroundColor: "#f0f0f0",
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          <Button className="submitBtn_feedBack">Submit Feedback</Button>
          <Button className="ReleseBtn" onClick={handleExitCustomer}>
            Relese Customer
          </Button>
        </Box>
      </Drawer>

      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Customer</p>
          <div style={{ display: "flex", gap: "15px" }}>
            <Button
              className="AddCustomer_Btn"
              onClick={() => navigate("/Profile")}
              variant="contained"
            >
              <CircleUser />
            </Button>
            <Button
              className="AddCustomer_Btn"
              onClick={handleNaviagte}
              variant="contained"
            >
              <CirclePlus />
            </Button>
          </div>
        </div>
      </div>

      <div className="CustomerContainer">
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
                <div className="status-badge-container">{renderStatus(e)}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Customer;
