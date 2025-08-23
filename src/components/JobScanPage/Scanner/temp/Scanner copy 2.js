import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Scanner.scss";
import { showToast } from "../../../Utils/Tostify/ToastManager";
import { CallApi } from "../../../API/CallApi/CallApi";
import Webcam from "react-webcam";
import jsQR from "jsqr";
const CANVAS_SIDE = 400; // side‑length we’ll decode at (≤ BOX_PX * devicePixelRatio)
const SCAN_INTERVAL = 200; // ms between decode attempts  (≈5 fps)
const hasBarcodeAPI = "BarcodeDetector" in window;
const Scanner = () => {
  const [scannedData, setScannedData] = useState([]);
  const [mode, setMode] = useState("qr");
  const [manualInput, setManualInput] = useState("");
  const [activeDetail, setActiveDetail] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const activeCustomer = JSON.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );
  const [zoomCap, setZoomCap] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scanningRef = useRef(false);
  const cooldownTime = 2000;
  const webcamRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const trackRef = useRef(null);
  const decodeTimerRef = useRef(null);
  const detectorRef = useRef(
    hasBarcodeAPI ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null
  );

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
        setIsLoading(false);

        if (!jobData) {
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
          makingCharge: jobData.TotalMakingCost,
          taxAmount: jobData.TotalTaxAmount?.toFixed(0),
          netWeight: jobData.NetWt?.toFixed(3),
          GrossWeight: jobData.GrossWt?.toFixed(3),
          CartListId: jobData.CartListId,
          WishListId: jobData.WishListId,
          Category: jobData?.Category,
          TotalMetalCost: jobData?.TotalMetalCost?.toFixed(0),
          TotalDiamondCost: jobData?.TotalDiamondCost?.toFixed(0),
          TotalColorstoneCost: jobData?.TotalColorstoneCost?.toFixed(0),
          TotalMiscCost: jobData?.TotalMiscCost?.toFixed(0),
          TotalMakingCost: (
            jobData?.TotalMakingCost +
            jobData?.TotalDiamondhandlingCost +
            jobData?.TotalOtherCost
          )?.toFixed(0),
          DiamondWtP:
            jobData?.DiaWt > 0 || jobData?.DiaPcs > 0
              ? `${jobData.DiaWt > 0 ? jobData.DiaWt?.toFixed(3) : ""}${
                  jobData.DiaWt > 0 && jobData.DiaPcs > 0 ? " / " : ""
                }${jobData.DiaPcs > 0 ? jobData.DiaPcs + "pcs" : ""}`
              : null,
          colorStoneWtP:
            jobData?.CsWt > 0 || jobData?.CsPcs > 0
              ? `${jobData?.CsWt > 0 ? jobData.CsWt?.toFixed(3) : ""}${
                  jobData?.CsWt > 0 && jobData?.CsPcs > 0 ? " / " : ""
                }${jobData?.CsPcs > 0 ? jobData.CsPcs + "pcs" : ""}`
              : null,
          MiscWtP:
            jobData?.MiscWt > 0 || jobData?.MiscPcs > 0
              ? `${jobData?.MiscWt > 0 ? jobData.MiscWt?.toFixed(3) : ""}${
                  jobData?.MiscWt > 0 && jobData?.MiscPcs > 0 ? " / " : ""
                }${jobData?.MiscPcs > 0 ? jobData.MiscPcs + "pcs" : ""}`
              : null,
          MetalTypeTitle: `${
            jobData?.MetalPurity +
            " " +
            jobData?.MetalTypeName +
            " " +
            jobData?.MetalColorName
          }`,
          status: "Scanned",
          image: `${jobData.CDNDesignImageFol}${jobData.ImageName}`, // "1/281165"
          isInCartList: jobData.IsInCartList, // NEW
          isInWishList: jobData.IsInWishList, // NEW
        };

        setScannedData((prevScannedData) => {
          const currentScans = Array.isArray(prevScannedData)
            ? prevScannedData
            : [];
          const newUpdatedData = [
            formatted,
            ...currentScans.filter((j) => j.JobNo !== formatted.JobNo),
          ];
          sessionStorage.setItem(
            "AllScanJobData",
            JSON.stringify(newUpdatedData)
          );
          return newUpdatedData;
        });

        setActiveDetail(formatted);
        setIsExpanded(true);
        showToast({
          message: `Job ${jobNumber} scanned successfully`,
          bgColor: "#27ae60",
          fontColor: "#fff",
          duration: 2500,
        });
      } catch (err) {
        setIsLoading(false);
        showToast({
          message: `Error scanning job: ${jobNumber}`,
          bgColor: "#f13f3f",
          fontColor: "#fff",
          duration: 2500,
        });
        return false;
      } finally {
        setIsLoading(false);
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

  return (
    <div className="scanner-container">
      <div
        style={{
          display: mode === "qr" ? "block" : "none",
          height: "320px",
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
            videoConstraints={{
              facingMode: { ideal: "environment" },
              width: { ideal: 640 },
              height: { ideal: 350 },
              advanced: zoomCap ? [{ zoom: zoomLevel }] : undefined,
            }}
          />
          <div className="scan-box" />
        </div>
      </div>
    </div>
  );
};

export default Scanner;
