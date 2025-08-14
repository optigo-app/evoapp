import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Scanner.scss";
import { Box, Button, Stack } from "@mui/material";
import { Keyboard, Menu, Printer, ScanLine, Share2 } from "lucide-react";
import { showToast } from "../../../Utils/Tostify/ToastManager";
import { CallApi } from "../../../API/CallApi/CallApi";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import LoadingBackdrop from "../../../Utils/LoadingBackdrop";

const CANVAS_SIDE = 400; // side‑length we’ll decode at (≤ BOX_PX * devicePixelRatio)
const SCAN_INTERVAL = 200; // ms between decode attempts  (≈5 fps)
const hasBarcodeAPI = "BarcodeDetector" in window;

const Scanner = () => {
  const [scannedData, setScannedData] = useState([]);
  const [mode, setMode] = useState("qr");
  const [manualInput, setManualInput] = useState("");
  const [activeDetail, setActiveDetail] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const activeCustomer = JSON.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );
  const webcamRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const trackRef = useRef(null);
  const decodeTimerRef = useRef(null);
  const detectorRef = useRef(
    hasBarcodeAPI ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null
  );
  // const [permissionGranted, setPermissionGranted] = useState(null);
  // const [checkingPerm, setCheckingPerm] = useState(true);
  const [zoomCap, setZoomCap] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scanningRef = useRef(false);
  const cooldownTime = 2000;

  // useEffect(() => {
  //   navigator.permissions
  //     ?.query({ name: "camera" })
  //     .then((result) => {
  //       if (result.state === "granted") {
  //         setPermissionGranted(true);
  //       } else if (result.state === "prompt") {
  //         setPermissionGranted(null);
  //       } else {
  //         setPermissionGranted(false);
  //       }
  //       setCheckingPerm(false);
  //     })
  //     .catch(() => {
  //       setPermissionGranted(null);
  //       setCheckingPerm(false);
  //     });
  // }, []);

  useEffect(() => {
    const savedScans = sessionStorage.getItem("AllScanJobData");
    if (savedScans) {
      try {
        const parsed = JSON.parse(savedScans);
        if (Array.isArray(parsed)) {
          setScannedData(parsed);
          if (parsed.length > 0) {
            setActiveDetail(parsed[0]);
          }
        } else {
          console.error(
            "Invalid data found in sessionStorage for AllScanJobData:",
            parsed
          );
          setScannedData([]);
        }
      } catch (e) {
        console.error("Error parsing AllScanJobData from sessionStorage:", e);
        setScannedData([]);
      }
    }
  }, []);

  const handleUserMedia = (stream) => {
    const [track] = stream.getVideoTracks();
    trackRef.current = track;
    const caps = track.getCapabilities?.();
    if (caps?.zoom) {
      const { min, max, step = 0.1 } = caps.zoom;
      setZoomCap({ min, max, step });
      setZoomLevel(min ?? 1);
      track.applyConstraints({ advanced: [{ zoom: min }] }).catch(() => {});
    }
    canvasRef.current.width = CANVAS_SIDE;
    canvasRef.current.height = CANVAS_SIDE;
    decodeTimerRef.current = setInterval(decodeFrame, SCAN_INTERVAL);
  };

  const addScan = useCallback(
    async (jobNumber) => {
      const list = JSON.parse(sessionStorage.getItem("AllScanJobData"));
      if (list?.some((item) => item?.JobNo === jobNumber)) {
        setError(`Job ${jobNumber} already scanned`);
        showToast({
          message: `Job ${jobNumber} already scanned`,
          bgColor: "#f1c40f",
          fontColor: "#000",
          duration: 2500,
        });
        return false;
      }
      try {
        const Device_Token = sessionStorage.getItem("device_token");
        const body = {
          Mode: "GetScanJobData",
          Token: Device_Token,
          ReqData: JSON.stringify([
            {
              ForEvt: "GetScanJobData",
              DeviceToken: Device_Token,
              AppId: 3,
              JobNo: jobNumber,
              CustomerId: activeCustomer?.CustomerId,
              IsVisitor: 0,
            },
          ]),
        };
        const response = await CallApi(body);
        const jobData = response?.DT[0];

        if (!jobData) {
          setError(`Invalid job number: ${jobNumber}`);
          showToast({
            message: `Invalid job number: ${jobNumber}`,
            bgColor: "#f13f3f",
            fontColor: "#fff",
            duration: 2500,
          });
          return false;
        }

        const formatted = {
          JobNo: jobData.JobNo,
          designNo: jobData.DesignNo,
          price: jobData.Amount?.toFixed(0),
          metal: jobData.TotalMetalCost,
          diamoond: jobData.TotalDiamondCost,
          colorStone: jobData.TotalColorstoneCost,
          status: "Scanned",
          image: `${jobData.CDNDesignImageFol}${jobData.ImageName}`,
          isInCartList: jobData.IsInCartList,
          isInWishList: jobData.IsInWishList,
        };

        setScannedData((prev) => {
          const newUpdatedData = [
            formatted,
            ...(prev || []).filter((j) => j.JobNo !== formatted.JobNo),
          ];
          sessionStorage.setItem(
            "AllScanJobData",
            JSON.stringify(newUpdatedData)
          );
          return newUpdatedData;
        });

        setActiveDetail(formatted);
        setIsExpanded(true);
        setError(null);

        showToast({
          message: `Job ${jobNumber} scanned successfully`,
          bgColor: "#27ae60",
          fontColor: "#fff",
          duration: 2500,
        });
        return true;
      } catch (err) {
        setError(`Error scanning job: ${jobNumber}`);
        showToast({
          message: `Error scanning job: ${jobNumber}`,
          bgColor: "#f13f3f",
          fontColor: "#fff",
          duration: 2500,
        });
        return false;
      }
    },
    [activeCustomer]
  );

  const decodeFrame = useCallback(async () => {
    if (scanningRef.current) return;

    const video = webcamRef.current?.video;
    if (!video || video.readyState < 2) return;

    const { videoWidth: w, videoHeight: h } = video;
    const side = Math.min(w, h);
    const sx = (w - side) / 2;
    const sy = (h - side) / 2;
    const ctx = canvasRef.current.getContext("2d", {
      willReadFrequently: true,
    });
    ctx.drawImage(video, sx, sy, side, side, 0, 0, CANVAS_SIDE, CANVAS_SIDE);

    let result = null;
    if (hasBarcodeAPI) {
      const barcodes = await detectorRef.current.detect(canvasRef.current);
      if (barcodes.length) result = barcodes[0].rawValue;
    } else {
      const imgData = ctx.getImageData(0, 0, CANVAS_SIDE, CANVAS_SIDE);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      result = code?.data;
    }

    if (result) {
      scanningRef.current = true;
      setIsLoading(true);
      const jobNo = result.trim();
      const isValid = await addScan(jobNo);
      setTimeout(() => {
        scanningRef.current = false;
      }, cooldownTime);
      setIsLoading(false);
    }
  }, [addScan]);

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
      <div className="top-detail-card_Big expanded">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>
            {activeDetail.designNo} ({activeDetail?.JobNo})
          </span>
          <span>{activeDetail.Category}</span>
        </div>
      </div>
    );

  const [expandedItems, setExpandedItems] = useState([]);

  return (
    <div className="scanner-container">
      <LoadingBackdrop isLoading={isLoading} />

      {/* Keep webcam always mounted */}
      <div
        style={{
          display: mode === "qr" ? "block" : "none",
          height: "300px",
          width: "100%",
        }}
      >
        <div
          className={`camera-container ${
            zoomCap ? "camera-hw-zoom" : "camera-css-zoom"
          }`}
        >
          <Webcam
            ref={webcamRef}
            mirrored={false}
            audio={false}
            playsInline
            muted
            className="camera-feed"
            onUserMedia={handleUserMedia}
            // onUserMediaError={() => setPermissionGranted(false)}
            videoConstraints={{
              facingMode: { ideal: "environment" },
              width: { ideal: 640 },
              height: { ideal: 480 },
              advanced: zoomCap ? [{ zoom: zoomLevel }] : undefined,
            }}
          />
          <div className="scan-box" />
        </div>
      </div>

      {/* All Scan Item Tab */}
      <div style={{ display: mode === "AllScanItem" ? "block" : "none" }}>
        {scannedData.length !== 0 ? (
          <div className={`expand-container ${isExpanded ? "expanded" : ""}`}>
            {scannedData.map((data, idx) => {
              const isExpanded = expandedItems.includes(idx);
              return (
                <div key={idx} className="recent-item">
                  <div
                    className="top-detail-card_Big"
                    style={{
                      border: "1px solid #ccc",
                      marginBottom: "10px",
                      overflow: "hidden",
                      boxShadow:
                        "rgba(0, 0, 0, 0.01) 0px 0px 3px 0px, rgba(27, 31, 35, 0.1) 0px 0px 0px 1px !important",
                      backgroundColor: "rgb(248 248 248 / 49%)",
                    }}
                  >
                    <h4 style={{ margin: "5px 2px" }}>
                      {data.designNo} ({data?.JobNo})
                    </h4>
                    <p style={{ margin: "0px" }}>{data.Category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "70vh",
            }}
          >
            <p>No Product Scanned</p>
          </div>
        )}
      </div>

      {/* Manual Input Tab */}
      <div style={{ display: mode === "manual" ? "block" : "none" }}>
        <div className="manual-input">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleManualSave();
              }
            }}
            placeholder="Enter job number"
          />
          <button onClick={handleManualSave}>Save</button>
        </div>
      </div>

      {/* Error message */}
      {error && mode !== "AllScanItem" && (
        <p className="error-message">{error}</p>
      )}

      {/* Expanded/Collapsed Top Details */}
      {activeDetail &&
        mode !== "AllScanItem" &&
        (isExpanded ? renderExpandedTop() : renderCollapsedTop())}

      {/* Bottom Navigation */}
      <Box className="JobScannerPage">
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          className="text-buttons"
        >
          <Button
            onClick={() => setMode("AllScanItem")}
            className={mode === "AllScanItem" ? "active" : ""}
            variant="text"
          >
            <Menu />
          </Button>
          <Button
            onClick={() => setMode("qr")}
            className={mode === "qr" ? "active" : ""}
            variant="text"
          >
            <ScanLine />
          </Button>
          <Button
            onClick={() => setMode("manual")}
            className={mode === "manual" ? "active" : ""}
            variant="text"
          >
            <Keyboard />
          </Button>
        </Stack>
      </Box>
    </div>
  );
};

export default Scanner;
