import React, { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import "./Scanner.scss";
import { Box, Button, Stack } from "@mui/material";
import { GetJobScanData } from "../../../API/GetJobScanData/GetJobScanData";
import { ShoppingBag } from "lucide-react";

const Scanner = () => {
  const [scannedData, setScannedData] = useState([]);
  const [mode, setMode] = useState("qr");
  const [manualInput, setManualInput] = useState("");
  const [activeDetail, setActiveDetail] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedScans = sessionStorage.getItem("AllScanJobData");
    if (savedScans) {
      const parsed = JSON.parse(savedScans);
      setScannedData(parsed);
      if (parsed.length > 0) setActiveDetail(parsed[0]);
    }

    // Camera permission
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        console.log("Camera permission granted");
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((err) => {
        console.error("Camera permission denied", err);
        setError("Camera permission denied. Please allow camera access.");
      });
  }, []);

  const addScan = async (jobNumber) => {
    try {
      const response = await GetJobScanData(jobNumber);

      const jobData = response?.DT[0];

      console.log("response", response);
      if (!jobData) {
        setError("Invalid Job Number or No Data Found.");
        return;
      }

      const formatted = {
        jobNumber: jobData.JobNo,
        designNo: jobData.DesignNo,
        price: jobData.Amount,
        metal: jobData.TotalMetalCost,
        diamoond: jobData.TotalDiamondCost,
        colorStone: jobData.TotalColorstoneCost,
        makingCharge: jobData.TotalMakingCost,
        taxAmount: jobData.TotalOtherCost,
        netWeight: jobData.NetWt,
        GrossWeight: jobData.GrossWt,
        status: "Scanned",
        image: `${jobData.CDNDesignImageFol}${jobData.ImageName}`,
      };

      const updatedData = [
        formatted,
        ...scannedData.filter((j) => j.jobNumber !== formatted.jobNumber),
      ].slice(0, 5);

      setScannedData(updatedData);
      setActiveDetail(formatted);
      setIsExpanded(true);
      sessionStorage.setItem("AllScanJobData", JSON.stringify(updatedData));
      setError(null);
    } catch (err) {
      console.error("Error during scan", err);
      setError("Failed to fetch job data.");
    }
  };

  const handleManualSave = () => {
    if (manualInput.trim()) {
      addScan(manualInput.trim());
      setManualInput("");
    }
  };

  const renderCollapsedTop = () =>
    activeDetail && (
      <div
        className="top-detail-card collapsed"
        onClick={() => setIsExpanded(true)}
      >
        <div className="left">
          <strong>{activeDetail.jobNumber}</strong>
          <p>₹{activeDetail.price}</p>
        </div>
        <div className="right">Tap to open</div>
      </div>
    );

  const renderExpandedTop = () =>
    activeDetail && (
      <div className="top-detail-card expanded">
        <div className="header">
          <span>{activeDetail.jobNumber}</span>
          <button onClick={() => setIsExpanded(false)}>Close</button>
        </div>
        <div className="body">
          <h3>₹{activeDetail.price}</h3>
          <p className="info_main_section">
            Metal:{" "}
            <span className="info_main_section_span">
              ₹{activeDetail.metal}
            </span>
          </p>
          <p className="info_main_section">
            Diamond:{" "}
            <span className="info_main_section_span">
              ₹{activeDetail.diamoond}
            </span>
          </p>
          <p className="info_main_section">
            Color Stone:{" "}
            <span className="info_main_section_span">
              ₹{activeDetail.colorStone}
            </span>
          </p>
          <p className="info_main_section">
            Making Charges:{" "}
            <span className="info_main_section_span">
              ₹{activeDetail.makingCharge}
            </span>
          </p>
          <p className="info_main_section">
            Tax Amount:{" "}
            <span className="info_main_section_span">
              ₹{activeDetail.taxAmount}
            </span>
          </p>
          <div className="weights">
            <p style={{ display: "flex", flexDirection: "column" }}>
              Net Weight{" "}
              <span style={{ color: "#00a2e1", fontWeight: 600 }}>
                {activeDetail.netWeight} gm
              </span>
            </p>
            <p style={{ display: "flex", flexDirection: "column" }}>
              Gross Weight{" "}
              <span style={{ color: "#00a2e1", fontWeight: 600 }}>
                {activeDetail.GrossWeight} gm
              </span>
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="scanner-container">
      <p className="ProductScanTitle">Product Scanner</p>

      {mode === "qr" ? (
        <div className="qr-scanner-box">
          <QrReader
            constraints={{ facingMode: "environment" }}
            scanDelay={100}
            onResult={(result, error) => {
              if (result) {
                const jobNumber = result?.text || "";
                if (jobNumber.length > 3) {
                  addScan(jobNumber);
                }
              }
              if (error) {
                console.error("QR Scan Error:", error);
              }
            }}
            videoStyle={{ width: "100%", borderRadius: 8 }}
            style={{ width: "100%" }}
          />
        </div>
      ) : (
        <div className="manual-input">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Enter job number"
          />
          <button onClick={handleManualSave}>Save</button>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {activeDetail &&
        (isExpanded ? renderExpandedTop() : renderCollapsedTop())}

      {scannedData.length !== 0 && (
        <div className="recent-scans">
          <p className="ProductScanTitleRecent">Recent Scans</p>
          {scannedData.map((data, idx) => (
            <div
              key={idx}
              className="recent-item"
              onClick={() => {
                setActiveDetail(data);
                setIsExpanded(true);
              }}
            >
              <div className="left">
                <strong>{data.jobNumber}</strong>
                <p>₹{data.price}</p>
              </div>
              <div>
                <ShoppingBag />
              </div>
              {/* <div className="status">{data.status}</div> */}
            </div>
          ))}
        </div>
      )}

      <Box className="JobScannerPage">
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          className="text-buttons"
        >
          <Button
            onClick={() => setMode("qr")}
            className={mode === "qr" ? "active" : ""}
            variant="text"
          >
            Scanner
          </Button>
          <Button
            onClick={() => setMode("manual")}
            className={mode === "manual" ? "active" : ""}
            variant="text"
          >
            Manual
          </Button>
        </Stack>
      </Box>
    </div>
  );
};

export default Scanner;
