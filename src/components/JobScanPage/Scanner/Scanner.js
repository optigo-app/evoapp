import React, { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import productData from "./ProductData.json";
import "./Scanner.scss";
import { Box, Button, Divider, Stack } from "@mui/material";

const Scanner = () => {
  const [scannedData, setScannedData] = useState([]);
  const [mode, setMode] = useState("qr");
  const [manualInput, setManualInput] = useState("");
  const [activeDetail, setActiveDetail] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        console.log("Camera permission granted");
        stream.getTracks().forEach((track) => track.stop()); // release immediately
      })
      .catch((err) => {
        console.error("Camera permission denied", err);
        setError(
          "Camera permission denied. Please allow camera access in settings."
        );
      });
  }, []);

  const findProduct = (jobNumber) =>
    productData.find((item) => item.jobNumber === jobNumber);

  const addScan = (jobNumber) => {
    const product = findProduct(jobNumber);
    if (!product) return;
    setScannedData((prev) => {
      const newList = [jobNumber, ...prev.filter((j) => j !== jobNumber)];
      return newList.slice(0, 5);
    });

    setActiveDetail(product);
    setIsExpanded(true);
  };

  const handleScan = (result) => {
    if (result) {
      const data = result?.text || "";
      const isLikelyValidQR = data.length > 3; // You can make this stricter

      if (isLikelyValidQR) {
        addScan(data);
      }
    }
    if (error) {
      console.error("QR Error:", error);
    }
  };

  const handleManualSave = () => {
    if (manualInput.trim()) {
      addScan(manualInput.trim());
      setManualInput("");
    }
  };

  const renderCollapsedTop = () => (
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

  const renderExpandedTop = () => (
    <div className="top-detail-card expanded">
      <div className="header">
        <span>{activeDetail.jobNumber}</span>
        <button onClick={() => setIsExpanded(false)}>Close</button>
      </div>
      <div className="body">
        <h3>₹{activeDetail.price}</h3>
        <p className="info_main_section">
          Metal:
          <span className="info_main_section_span">₹{activeDetail.metal}</span>
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

      {activeDetail &&
        (isExpanded ? renderExpandedTop() : renderCollapsedTop())}

      {scannedData.length !== 0 && (
        <div className="recent-scans">
          <p className="ProductScanTitleRecent">Recent Scans</p>
          {scannedData.map((jobNumber, idx) => {
            const data = findProduct(jobNumber);
            if (!data) return null;
            return (
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
                <div className="status">{data.status}</div>
              </div>
            );
          })}
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
