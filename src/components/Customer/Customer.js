import React, { useEffect, useState } from "react";
import "./Customer.scss";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CustomerData = [
  {
    customerId: 101,
    customerName: "John Doe",
    customerSessionStatus: "Active",
    customerSessionStatusOther: "false",
    runningSessionTime: "00:45:32",
    email: "john.doe@example.com",
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

const parseTimeToSeconds = (timeString) => {
  const [h, m, s] = timeString.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

const formatSecondsToTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const Customer = () => {
  const [mainData, setMainData] = useState(CustomerData);
  const [result, setResult] = useState([]);
  const [search, setSearch] = useState("");
  const [timers, setTimers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        mainData.forEach((cust) => {
          if (cust.customerSessionStatus === "Active") {
            const id = cust.customerId;
            updated[id] =
              (updated[id] ?? parseTimeToSeconds(cust.runningSessionTime)) + 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mainData]);

  const filteredData = result.length > 0 ? result : mainData;

  const handleSearch = () => {
    const filtered = mainData.filter((item) =>
      item.customerName.toLowerCase().includes(search.toLowerCase())
    );
    setResult(filtered);
  };

  const renderStatus = (customer) => {
    if (
      customer.customerSessionStatus === "true" &&
      customer.customerSessionStatusOther === "true"
    ) {
      return <span className="badge bg-info">In Session</span>;
    }

    if (customer.customerSessionStatus === "Active") {
      const seconds =
        timers[customer.customerId] ??
        parseTimeToSeconds(customer.runningSessionTime);
      return (
        <span className="badge bg-success">
          {formatSecondsToTime(seconds)}
        </span>
      );
    }

    if (customer.customerSessionStatus === "Inactive") {
      return <span className="badge bg-secondary">Available</span>;
    }

    return null;
  };

  return (
    <div className="CustomerMain">
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Customer</p>
          <Button className="AddCustomer_Btn" onClick={() => navigate("/AddCustomer")}>
            Add Customer
          </Button>
        </div>
      </div>

      <div className="CustomerContainer">
        <div className="CustomerList">
          {filteredData.map((e, i) => (
            <div key={i} className="customer-card">
              <div className="card-header">
                <div>
                  <h5>{e.customerName}</h5>
                  <p className="text-muted">{e.email}</p>
                  <p className="text-muted">{e.mobileNumber}</p>
                </div>
                <div className="status-badge">{renderStatus(e)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="CustomerSearch">
          <label htmlFor="customername">Customer Name</label>
          <div className="search-box">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter customer name"
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customer;
