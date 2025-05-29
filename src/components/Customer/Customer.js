import React, { useEffect, useState } from "react";
import "./Customer.scss";
import { Button, Snackbar, Slide } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AiOutlineCloseCircle, AiOutlineLock } from "react-icons/ai";
import { CallApi } from "../../API/CallApi/CallApi";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import { CirclePlus, CircleUser } from "lucide-react";
import { showToast } from "../../Utils/Tostify/ToastManager";

const parseTimeToSeconds = (start, current) => {
  const startDate = new Date(start);
  const currentDate = new Date(current);
  return Math.floor((currentDate - startDate) / 1000);
};

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
  const [loading, setLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
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

    console.log('customer.IsLockTimercustomer.IsLockTimer', customer.IsLockTimer);
    
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
      } else {
      }
    }else if (customer.IsLockTimer === 2) {
      navigate(`/JobScanPage`);
    }
    // if (customer.IsLockTimer === 1) {
    //   setSnackOpen(true);
    // } else {
    //   navigate(`/JobScanPage`);
    // }
  };

  const handleStop = async (customer) => {
    console.log(customer);
    const Device_Token = sessionStorage.getItem("device_token");
    const body = {
      Mode: "ExitCustomer",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "ExitCustomer",
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
                Stop
              </Button>
            )}
          </div>
          {/* <div style={{ fontSize: "11px", marginTop: "4px", color: "#f0f0f0" }}>
            {cust.StartDateTime} → {cust.CurrentTime}
          </div> */}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="CustomerMain">
      <LoadingBackdrop isLoading={loading} />
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
              onClick={() => navigate("/AddCustomer")}
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

      <Snackbar
        open={snackOpen}
        onClose={() => setSnackOpen(false)}
        autoHideDuration={3000}
        TransitionComponent={(props) => <Slide {...props} direction="down" />}
        message="Already in session!"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </div>
  );
};

export default Customer;

// import React, { useEffect, useState } from "react";
// import "./Customer.scss";
// import { Button, Snackbar, Slide } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { AiOutlineCloseCircle } from "react-icons/ai";
// import { AiOutlineLock } from "react-icons/ai"; // 🔒 Icon
// import { GetProfileData } from "../../API/GetProfileData/GetProfileData";
// import { CirclePlus } from "lucide-react";
// import { CircleUser } from 'lucide-react';
// import { CallApi } from "../../API/CallApi/CallApi";
// import LoadingBackdrop from "../../Utils/LoadingBackdrop";

// const CustomerData = [
//   {
//     customerId: 101,
//     customerName: "John Doe",
//     customerSessionStatus: "Active",
//     customerSessionStatusOther: "false",
//     runningSessionTime: "00:45:32",
//     email: "john.doe@example.com",
//     mobileNumber: "+1234567890",
//   },
//   {
//     customerId: 102,
//     customerName: "Jane Smith",
//     customerSessionStatus: "Inactive",
//     customerSessionStatusOther: "true",
//     runningSessionTime: "00:00:00",
//     email: "jane.smith@example.com",
//     mobileNumber: "+1987654321",
//   },
//   {
//     customerId: 103,
//     customerName: "Session Tester",
//     customerSessionStatus: "true",
//     customerSessionStatusOther: "true",
//     runningSessionTime: "00:10:00",
//     email: "tester@example.com",
//     mobileNumber: "+1122334455",
//   },
// ];

// const parseTimeToSeconds = (timeString) => {
//   const [h, m, s] = timeString.split(":").map(Number);
//   return h * 3600 + m * 60 + s;
// };

// const formatSecondsToTime = (seconds) => {
//   const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
//   const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
//   const s = String(seconds % 60).padStart(2, "0");
//   return `${h}:${m}:${s}`;
// };

// const Customer = () => {
//   const [mainData, setMainData] = useState(CustomerData);
//   const [result, setResult] = useState([]);
//   const [search, setSearch] = useState("");
//   const [timers, setTimers] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [snackOpen, setSnackOpen] = useState(false);
//   const navigate = useNavigate();

//   const GetProfileDataFun = async () => {
//     const Device_Token = sessionStorage.getItem("device_token");

//     const body = {
//       Mode: "GetCustomerData",
//       Token: `"${Device_Token}"`,
//       ReqData: JSON.stringify([
//         {
//           ForEvt: "GetCustomerData",
//           DeviceToken: Device_Token,
//           AppId: 3,
//         },
//       ]),
//     };

//     const response = await CallApi(body);
//     console.log("responseresponse", response);
//   };

//   useEffect(() => {
//     GetProfileDataFun();
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimers((prev) => {
//         const updated = { ...prev };
//         mainData.forEach((cust) => {
//           if (cust.customerSessionStatus === "Active") {
//             const id = cust.customerId;
//             updated[id] =
//               (updated[id] ?? parseTimeToSeconds(cust.runningSessionTime)) + 1;
//           }
//         });
//         return updated;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [mainData]);

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       const filtered = mainData.filter((item) =>
//         item.customerName.toLowerCase().includes(search.toLowerCase())
//       );
//       setResult(filtered);
//     }
//   };

//   const handleClearSearch = () => {
//     setSearch("");
//     setResult([]);
//   };

//   const filteredData = result.length > 0 ? result : mainData;

//   const handleClickStatus = (customer) => {
//     const status = customer.customerSessionStatus;
//     const other = customer.customerSessionStatusOther;

//     if (status === "true" && other === "true") {
//       setSnackOpen(true);
//     } else {
//       navigate(`/JobScanPage`);
//     }
//   };

//   const renderStatus = (customer) => {
//     const isInSession =
//       customer.customerSessionStatus === "true" &&
//       customer.customerSessionStatusOther === "true";

//     if (isInSession) {
//       return (
//         <span className="status-badge in-session">
//           <AiOutlineLock style={{ marginRight: "5px" }} />
//           In Session
//         </span>
//       );
//     }

//     if (customer.customerSessionStatus === "Active") {
//       const seconds =
//         timers[customer.customerId] ??
//         parseTimeToSeconds(customer.runningSessionTime);
//       return (
//         <span className="status-badge active-timer">
//           {formatSecondsToTime(seconds)}
//         </span>
//       );
//     }

//     if (customer.customerSessionStatus === "Inactive") {
//       return <span className="status-badge available">Available</span>;
//     }

//     return null;
//   };

//   return (
//     <div className="CustomerMain">
//       <LoadingBackdrop isLoading={loading} />
//       <div className="Header_main">
//         <div className="header-container">
//           <p className="header_title">Customer</p>
//           <div style={{display :'flex', gap: '15px'}}>
//             <Button
//               className="AddCustomer_Btn"
//               onClick={() => navigate("/Profile")}
//               variant="contained"
//             >
//               <CircleUser />
//             </Button>
//             <Button
//               className="AddCustomer_Btn"
//               onClick={() => navigate("/AddCustomer")}
//               variant="contained"
//             >
//               <CirclePlus />
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="CustomerContainer">
//         <div className="CustomerSearch">
//           <div className="search-box">
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Filter By Customer Name"
//             />
//             {search && (
//               <AiOutlineCloseCircle
//                 className="clear-icon"
//                 onClick={handleClearSearch}
//               />
//             )}
//           </div>
//         </div>

//         <div className="CustomerList">
//           {filteredData.map((e, i) => (
//             <Button
//               key={i}
//               className="customercard_button"
//               onClick={() => handleClickStatus(e)}
//             >
//               <div className="card-header">
//                 <div>
//                   <h5>{e.customerName}</h5>
//                   <p className="text-muted">{e.email}</p>
//                   <p className="text-muted">{e.mobileNumber}</p>
//                 </div>
//                 <div className="status-badge-container">{renderStatus(e)}</div>
//               </div>
//             </Button>
//           ))}
//         </div>
//       </div>

//       <Snackbar
//         open={snackOpen}
//         onClose={() => setSnackOpen(false)}
//         autoHideDuration={3000}
//         TransitionComponent={(props) => <Slide {...props} direction="down" />}
//         message="Already in session!"
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       />
//     </div>
//   );
// };

// export default Customer;
