import React, { useCallback, useEffect, useRef, useState } from "react";
import { QrReader } from "react-qr-reader";
import "./Scanner.scss";
import {
  Box,
  Button,
  Stack,
  Modal,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowDown,
  ArrowUp,
  Keyboard,
  Menu,
  Printer,
  ScanLine,
  Share2,
  ShoppingBag,
  Tally3,
} from "lucide-react";
import { showToast } from "../../../Utils/Tostify/ToastManager";
import { Heart } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Percent } from "lucide-react";
import { CallApi } from "../../../API/CallApi/CallApi";
import DiscountModal from "./DiscountModal";
import PlaceHolderImg from "../../../assests/placeHolderImg.svg";
import {
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import LoadingBackdrop from "../../../Utils/LoadingBackdrop";
import html2pdf from "html2pdf.js";
import PritnModel from "./PritnModel/PritnModel";

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
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountProductData, setDiscoutProductData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [printInfo, setPrintInfo] = useState();
  const activeCustomer = JSON.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );
  const printRef = useRef(null);

  const webcamRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const trackRef = useRef(null);
  const decodeTimerRef = useRef(null);
  const detectorRef = useRef(
    hasBarcodeAPI ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null
  );
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [checkingPerm, setCheckingPerm] = useState(true);
  const [zoomCap, setZoomCap] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [openPrintModel, setOpenPrintModel] = useState(false);
  const [printAllData, setPrintAllData] = useState(false);
  const [printOption, setPrintOption] = useState(true);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setPermissionGranted(true);
      })
      .catch(() => setPermissionGranted(false))
      .finally(() => setCheckingPerm(false));
  }, []);

  // useEffect(() => {
  //   const savedScans = sessionStorage.getItem("AllScanJobData");
  //   if (savedScans) {
  //     const parsed = JSON.parse(savedScans);
  //     setScannedData(savedScans);
  //     if (parsed.length > 0) setActiveDetail(parsed[0]);
  //   }
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

  // const stopStream = () => {
  //   clearInterval(decodeTimerRef.current);
  //   trackRef.current?.stop();
  // };

  // const updateZoom = (delta) => {
  //   if (!zoomCap) return; // CSS fallback: no HW zoom available
  //   const { min, max, step } = zoomCap;
  //   let next = Math.max(min, Math.min(max, +(zoomLevel + delta).toFixed(2)));
  //   setZoomLevel(next);
  //   trackRef.current
  //     ?.applyConstraints({ advanced: [{ zoom: next }] })
  //     .catch(() => {});
  // };

  const BOX = 220;

  const decodeFrame = useCallback(async () => {
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
      const jobNo = result.trim();
      setIsLoading(true);
      addScan(jobNo);
    }
  }, []);

  const retryPermission = () => {
    setPermissionGranted(null);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        s.getTracks().forEach((t) => t.stop());
        setPermissionGranted(true);
      })
      .catch(() => setPermissionGranted(false));
  };

  const addScan = useCallback(
    async (jobNumber) => {
      const list = JSON.parse(sessionStorage.getItem("AllScanJobData"));
      const alreadyScanned = list?.some((item) => item?.JobNo === jobNumber);
      if (alreadyScanned) {
        showToast({
          message: "Job already scanned",
          bgColor: "#f1c40f",
          fontColor: "#000",
          duration: 4000,
        });
        setIsLoading(false);
        return;
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
          setIsLoading(false);
          setError("Invalid Job Number or No Data Found.");
          return;
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
        setError(null);
      } catch (err) {
        setIsLoading(false);
        console.error("Error during scan", err);
        showToast({
          message: "Invalid Job",
          bgColor: "#f13f3f",
          fontColor: "#fff",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeCustomer]
  );

  const toggleWishlist = async (detailItem, data) => {
    const Device_Token = sessionStorage.getItem("device_token");
    const current = data ? detailItem : activeDetail;
    try {
      if (!current) return;
      if (current.isInWishList) {
        const body = {
          Mode: "RemoveFromWishList",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "RemoveFromWishList",
              DeviceToken: Device_Token,
              JobNo: current.JobNo,
              AppId: 3,
              CartWishId: current.WishListId || 0,
              IsRemoveAll: 0,
              CustomerId: activeCustomer?.CustomerId || 0,
              IsVisitor: activeCustomer?.IsVisitor || 0,
            },
          ]),
        };

        await CallApi(body);
        showToast({
          message: "Removed from Wishlist",
          bgColor: "#f44336",
          fontColor: "#fff",
          duration: 2000,
        });

        const updated = {
          ...current,
          isInWishList: 0,
        };
        updateScannedAndSession(updated);
      } else {
        const body = {
          Mode: "AddToWishList",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "AddToWishList",
              DeviceToken: Device_Token,
              AppId: 3,
              JobNo: current.JobNo,
              CustomerId: activeCustomer?.CustomerId || 0,
              IsWishList: 1,
              IsVisitor: activeCustomer?.IsVisitor || 0,
              DiscountOnId: current?.discountType == "flat" ? 1 : 0,
              Discount: current?.discountValue ?? 0,
            },
          ]),
        };

        const response = await CallApi(body);
        const insertedId = response?.DT?.[0]?.CartWishId || 0;

        showToast({
          message: "Added to Wishlist",
          bgColor: "#4caf50",
          fontColor: "#fff",
          duration: 2000,
        });

        const updated = {
          ...current,
          isInWishList: 1,
          CartWishId: insertedId,
        };
        updateScannedAndSession(updated);
      }
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
      showToast({
        message: "Something went wrong. Try again.",
        bgColor: "#ff9800",
        fontColor: "#fff",
        duration: 4000,
      });
    }
  };

  const toggleCart = async (detailItem, data) => {
    const Device_Token = sessionStorage.getItem("device_token");
    const current = data ? detailItem : activeDetail;
    try {
      if (!current) return;
      if (current.isInCartList) {
        const body = {
          Mode: "RemoveFromCart",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "RemoveFromCart",
              DeviceToken: Device_Token,
              AppId: 3,
              CartWishId: current.CartListId,
              JobNo: current.JobNo,
              IsRemoveAll: 0,
              CustomerId: activeCustomer.CustomerId || 0,
              IsVisitor: activeCustomer.IsVisitor || 0,
            },
          ]),
        };
        await CallApi(body);
        showToast({
          message: "Removed from Cart",
          bgColor: "#f44336",
          fontColor: "#fff",
          duration: 4000,
        });

        const updated = {
          ...current,
          isInCartList: 0,
        };
        updateScannedAndSession(updated);
      } else {
        const body = {
          Mode: "AddToCart",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "AddToCart",
              DeviceToken: Device_Token,
              AppId: 3,
              JobNo: current.JobNo,
              CustomerId: activeCustomer.CustomerId || 0,
              IsVisitor: activeCustomer.IsVisitor || 0,
              DiscountOnId: current?.discountType == "flat" ? 1 : 0,
              Discount: current?.discountValue ?? 0,
            },
          ]),
        };
        const response = await CallApi(body);
        const insertedId = response?.DT?.[0]?.CartWishId || 0;

        showToast({
          message: "Added to Cart",
          bgColor: "#4caf50",
          fontColor: "#fff",
          duration: 4000,
        });

        const updated = {
          ...current,
          isInCartList: 1,
          CartWishId: insertedId,
        };
        updateScannedAndSession(updated);
      }
    } catch (error) {
      console.error("Cart toggle failed:", error);
      showToast({
        message: "Something went wrong. Try again.",
        bgColor: "#ff9800",
        fontColor: "#fff",
        duration: 4000,
      });
    }
  };

  const updateScannedAndSession = (updatedItem) => {
    const updatedList = scannedData.map((item) =>
      item.JobNo === updatedItem.JobNo ? updatedItem : item
    );
    setScannedData(updatedList);
    setActiveDetail(updatedItem);
    sessionStorage.setItem("AllScanJobData", JSON.stringify(updatedList));
  };

  const handleManualSave = () => {
    if (manualInput.trim()) {
      addScan(manualInput.trim());
      setManualInput("");
    }
  };

  const handlePrint = (data, allData) => {
    const savedScans = JSON.parse(sessionStorage.getItem("AllScanJobData"));
    const matchedArray = savedScans?.filter((item) => item.JobNo === data);
    if (allData) {
      setPrintInfo(savedScans);
    } else {
      setPrintInfo(matchedArray);
    }
    const element = document.getElementById("printSection");
    // element.style.display = "block";
    const height = allData
      ? savedScans?.length >= 2
        ? savedScans?.length >= 3
          ? savedScans?.length * 170
          : savedScans?.length * 190
        : 250
      : 300;

    const opt = {
      margin: [5, 5, 5, 5],
      filename: "estimate.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: [250, height],
        orientation: "portrait",
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf("blob")
      .then((blob) => {
        const fileName = "estimate.pdf";
        // element.style.display = "none";
        if (window.flutter_inappwebview) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(",")[1];
            window.flutter_inappwebview.callHandler(
              "downloadPDF",
              base64data,
              fileName
            );
          };
          reader.readAsDataURL(blob);
        } else {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      });
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
  const handlePrintfind = (data, allData) => {
    const savedScans = JSON.parse(sessionStorage.getItem("AllScanJobData"));
    const matchedArray = savedScans?.filter((item) => item.JobNo === data);
    if (allData) {
      setPrintInfo(savedScans);
    } else {
      setPrintInfo(matchedArray);
    }
  };

  const handleShare = (data, allData) => {
    const savedScans = JSON.parse(sessionStorage.getItem("AllScanJobData"));
    const matchedArray = savedScans.filter((item) => item.JobNo === data);
    if (allData) {
      setPrintInfo(savedScans);
    } else {
      setPrintInfo(matchedArray);
    }
    const element = document.getElementById("printSection");
    const opt = {
      margin: [5, 5, 5, 5],
      filename: "estimate.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: [73, 297], orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf("blob")
      .then((blob) => {
        const fileName = "estimate.pdf";
        if (window.flutter_inappwebview) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(",")[1];
            window.flutter_inappwebview.callHandler(
              "sharePDF",
              base64data,
              fileName
            );
          };
          reader.readAsDataURL(blob);
        } else {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      });
  };

  const renderExpandedTop = () =>
    activeDetail && (
      <div className="top-detail-card_Big expanded">
        <div style={{ padding: "5px" }}>
          <div className="header">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span>
                {activeDetail.designNo} ({activeDetail?.JobNo})
              </span>
              <span>{activeDetail.Category}</span>
            </div>
            <div>
              <p
                style={{
                  display: "flex",
                  gap: "5px",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  className={
                    activeDetail?.discountedPrice
                      ? "showData_price_deatil_withdiscount"
                      : "showData_price_deatil"
                  }
                >
                  ₹ {activeDetail.price}
                </span>
              </p>

              {activeDetail?.discountedPrice && (
                <div>
                  <p
                    style={{
                      margin: "0px",
                      fontSize: "15px",
                      fontWeight: 600,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "3px",
                    }}
                    className="showData_price_deatil"
                  >
                    {" "}
                    <span
                      style={{
                        fontSize: "12px",
                        color: "green",
                        display: "flex",
                        alignItems: "end",
                      }}
                    >
                      Save{" "}
                      {activeDetail?.discountType === "percentage"
                        ? `${activeDetail?.discountValue}%`
                        : `₹${activeDetail?.discountValue}`}
                    </span>
                    ₹ {activeDetail.discountedPrice}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "5px" }}>
            <div style={{ width: "35%" }}>
              <img
                src={activeDetail?.image}
                onError={(e) => (e.target.src = PlaceHolderImg)}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="body" style={{ width: "65%" }}>
              {/* <div>
                <p className="showData_price_title">Actual Price</p>
                <p className="showData_price_deatil"> ₹{activeDetail.price}</p>
              </div> */}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex" }}>
                  {activeDetail.GrossWeight && (
                    <div
                      style={{
                        width: "32%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        {" "}
                        Gwt
                        <span style={{ fontSize: "10px" }}>(gm)</span>:{" "}
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.GrossWeight}{" "}
                      </span>
                    </div>
                  )}

                  {activeDetail.netWeight && (
                    <div
                      style={{
                        width: "30%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        {" "}
                        Net
                        <span style={{ fontSize: "10px" }}>(gm)</span>:
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.netWeight}{" "}
                      </span>
                    </div>
                  )}

                  {activeDetail.DiamondWtP && (
                    <div
                      style={{
                        width: "38%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        Dia.
                        <span style={{ fontSize: "10px" }}>(Ct)</span>:{" "}
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.DiamondWtP}{" "}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex" }}>
                  {activeDetail.colorStoneWtP && (
                    <div
                      style={{
                        width: "32%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        {" "}
                        CS
                        <span style={{ fontSize: "10px" }}>(Ct)</span>:{" "}
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.colorStoneWtP}
                      </span>
                    </div>
                  )}
                  {activeDetail.MiscWtP && (
                    <div
                      style={{
                        width: "38%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        {" "}
                        Misc
                        <span style={{ fontSize: "10px" }}>(gm)</span>:{" "}
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.MiscWtP}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "10px",
            }}
          >
            <Button
              className="scanner_List_moreview"
              onClick={() => toggleWishlist("", false)}
            >
              <Heart
                fill={activeDetail.isInWishList ? "#ff3366" : "none"}
                color={activeDetail.isInWishList ? "#ff3366" : "black"}
                style={{ height: "20px", width: "20px" }}
              />
            </Button>
            {/* <IconButton onClick={() => toggleWishlist("", false)}>
              <ShoppingCart
                className={`btn ${
                  activeDetail.isInWishList ? "btn-active" : ""
                }`}
              />
            </IconButton> */}
            <Button
              className="scanner_List_moreview"
              onClick={() => toggleCart("", false)}
            >
              <ShoppingCart
                fill={activeDetail.isInCartList ? "#4caf50" : "none"}
                color={activeDetail.isInCartList ? "#4caf50" : "black"}
                style={{ height: "20px", width: "20px" }}
              />
            </Button>

            <Button
              className="scanner_List_moreview"
              onClick={() => {
                if (activeDetail.isInCartList) {
                  showToast({
                    message: "Discount applied. Item added to cart.",
                    bgColor: "red",
                    fontColor: "#fff",
                    duration: 4000,
                  });
                } else if (activeDetail.isInWishList) {
                  showToast({
                    message: "Discount applied. Item added to wishlist.",
                    bgColor: "red",
                    fontColor: "#fff",
                    duration: 4000,
                  });
                } else {
                  setDiscountModalOpen(true);
                  setDiscoutProductData(activeDetail);
                }
              }}
            >
              <Percent
                fill={activeDetail.discountType ? "#4caf50" : "none"}
                color={activeDetail.discountType ? "#4caf50" : "black"}
                style={{ height: "20px", width: "20px" }}
              />
            </Button>

            <Button
              className="scanner_List_moreview"
              onClick={() => {
                setPrintOption(true);
                setPrintAllData(false);
                setOpenPrintModel(true);
                handlePrintfind(activeDetail?.JobNo, false);
              }}
              // onClick={() => handlePrint(activeDetail?.JobNo, false)}
            >
              <Printer style={{ height: "20px", width: "20px" }} />
            </Button>

            <Button
              className="scanner_List_moreview"
              onClick={() => {
                setPrintOption(false);
                setOpenPrintModel(true);
                handlePrintfind(activeDetail?.JobNo, false);
              }}
            >
              <Share2 style={{ height: "20px", width: "20px" }} />
            </Button>
          </div>
        </div>
      </div>
    );

  const [expandedItems, setExpandedItems] = useState([]);

  return (
    <div className="scanner-container">
      <LoadingBackdrop isLoading={isLoading} />
      <DiscountModal
        discountModalOpen={discountModalOpen}
        setDiscountModalOpen={setDiscountModalOpen}
        activeDetail={discountProductData}
        updateScannedAndSession={updateScannedAndSession}
        showToast={showToast}
      />
      {mode === "qr" ? (
        <div className="scanner-wrapper" style={{ "--box": `${BOX}px` }}>
          {permissionGranted === false && (
            <p className="status">
              ❌ Camera permission denied.{" "}
              <button onClick={retryPermission}>Retry</button>
            </p>
          )}

          {permissionGranted && (
            <>
              <div
                className="scanner-wrapper"
                style={{ height: "300px", width: "100%" }}
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
                    onUserMediaError={() => setPermissionGranted(false)}
                    videoConstraints={{
                      facingMode: { ideal: "environment" },
                      width: { ideal: 640 },
                      height: { ideal: 480 },
                      advanced: zoomCap ? [{ zoom: zoomLevel }] : undefined,
                    }}
                  />
                  <div className="scan-box" /> {/* white dashed overlay */}
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="status" style={{ color: "#ff6961" }}>
              {error}
            </p>
          )}
        </div>
      ) : mode == "AllScanItem" ? (
        <div></div>
      ) : (
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
      )}

      {error && mode != "AllScanItem" && (
        <p className="error-message">{error}</p>
      )}

      {activeDetail &&
        mode != "AllScanItem" &&
        (isExpanded ? renderExpandedTop() : renderCollapsedTop())}

      {scannedData.length !== 0 && mode === "AllScanItem" ? (
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
                  <div
                    className="summary-row"
                    onClick={() => {
                      setExpandedItems((prev) =>
                        prev.includes(idx)
                          ? prev.filter((i) => i !== idx)
                          : [...prev, idx]
                      );
                    }}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "5px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <h4 style={{ margin: "5px 2px" }}>
                            {data.designNo}({data?.JobNo})
                          </h4>

                          <p style={{ margin: "0px" }}>{data.Category}</p>
                        </div>

                        <div>
                          <h4
                            className={
                              data?.discountedPrice
                                ? "showData_price_deatil_withdiscount"
                                : "showData_price_deatil"
                            }
                          >
                            ₹ {data.price}
                          </h4>

                          {data?.discountedPrice && (
                            <div>
                              <p
                                style={{
                                  margin: "0px",
                                  fontSize: "15px",
                                  fontWeight: 600,
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: "3px",
                                }}
                                className="showData_price_deatil"
                              >
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "green",
                                    display: "flex",
                                    alignItems: "end",
                                  }}
                                >
                                  Save{" "}
                                  {data?.discountType === "percentage"
                                    ? `${data?.discountValue}%`
                                    : `₹${data?.discountValue}`}
                                </span>{" "}
                                ₹ {data.discountedPrice}
                              </p>
                            </div>
                          )}

                          <div
                            style={{
                              fontSize: "1.5rem",
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            {isExpanded ? (
                              <MdKeyboardDoubleArrowUp
                                style={{
                                  height: "20px",
                                  width: "20px",
                                  borderRadius: "50px",
                                  color: "#b3b2b2",
                                }}
                              />
                            ) : (
                              <MdKeyboardDoubleArrowDown
                                style={{
                                  height: "20px",
                                  width: "20px",
                                  borderRadius: "50px",
                                  color: "#b3b2b2",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`expand-wrapper ${isExpanded ? "expanded" : ""}`}
                  >
                    {isExpanded && (
                      <div
                        style={{
                          padding: "5px",
                          borderTop: "1px solid rgb(221 221 221 / 42%)",
                        }}
                      >
                        <div style={{ display: "flex", gap: "5px" }}>
                          <div style={{ width: "35%" }}>
                            <img
                              src={data?.image}
                              onError={(e) => (e.target.src = PlaceHolderImg)}
                              style={{
                                width: "100%",
                                objectFit: "contain",
                                height: "100%",
                              }}
                            />
                          </div>
                          <div className="body" style={{ width: "65%" }}>
                            {/* <div>
                              <p className="showData_price_title">
                                Actual Price
                              </p>
                              <p className="showData_price_deatil">
                                {" "}
                                ₹{data.price}
                              </p>
                            </div> */}

                            <p
                              className="desc_metal_line"
                              style={{
                                fontWeight: 600,
                                margin: "0px 0px 5px 0px ",
                              }}
                            >
                              Metal : {data?.MetalTypeTitle}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                              }}
                            >
                              <div style={{ display: "flex" }}>
                                {data?.GrossWeight !== null && (
                                  <div
                                    style={{
                                      width: "32%",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "2px",
                                    }}
                                  >
                                    <p className="info_main_section">
                                      Gwt
                                      <span style={{ fontSize: "10px" }}>
                                        (gm)
                                      </span>
                                      :{" "}
                                    </p>
                                    <span className="info_main_section_span">
                                      {data.GrossWeight}{" "}
                                    </span>
                                  </div>
                                )}
                                {data?.netWeight !== null && (
                                  <div
                                    style={{
                                      width: "30%",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "2px",
                                    }}
                                  >
                                    <p className="info_main_section">
                                      Net
                                      <span style={{ fontSize: "10px" }}>
                                        (gm)
                                      </span>
                                      :
                                    </p>
                                    <span className="info_main_section_span">
                                      {data.netWeight}{" "}
                                    </span>
                                  </div>
                                )}

                                {data.DiamondWtP && (
                                  <div
                                    style={{
                                      width: "38%",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "2px",
                                    }}
                                  >
                                    <p className="info_main_section">
                                      Dia.
                                      <span style={{ fontSize: "10px" }}>
                                        (Ct)
                                      </span>
                                      :
                                    </p>
                                    <span className="info_main_section_span">
                                      {data.DiamondWtP}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div style={{ display: "flex" }}>
                                {data?.colorStoneWtP && (
                                  <div
                                    style={{
                                      width: "32%",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "2px",
                                    }}
                                  >
                                    <p className="info_main_section">
                                      CS
                                      <span style={{ fontSize: "10px" }}>
                                        (Ct)
                                      </span>
                                      :{" "}
                                    </p>
                                    <span className="info_main_section_span">
                                      {data.colorStoneWtP}
                                    </span>
                                  </div>
                                )}
                                {data?.MiscWtP && (
                                  <div
                                    style={{
                                      width: "38%",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "2px",
                                    }}
                                  >
                                    <p className="info_main_section">
                                      Misc
                                      <span style={{ fontSize: "10px" }}>
                                        (gm)
                                      </span>
                                      :
                                    </p>
                                    <span className="info_main_section_span">
                                      {data.MiscWtP}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-around",
                            marginTop: "10px",
                          }}
                        >
                          <Button
                            className="scanner_List_moreview"
                            onClick={() => toggleWishlist(data, true)}
                          >
                            <Heart
                              fill={data.isInWishList ? "#ff3366" : "none"}
                              color={data.isInWishList ? "#ff3366" : "black"}
                              style={{ height: "20px", width: "20px" }}
                            />
                          </Button>

                          <Button
                            className="scanner_List_moreview"
                            onClick={() => toggleCart(data, true)}
                          >
                            <ShoppingCart
                              fill={data.isInCartList ? "#4caf50" : "none"}
                              color={data.isInCartList ? "#4caf50" : "black"}
                              style={{ height: "20px", width: "20px" }}
                            />
                          </Button>

                          <Button
                            className="scanner_List_moreview"
                            onClick={() => {
                              setDiscountModalOpen(true);
                              setDiscoutProductData(data);
                            }}
                          >
                            <Percent
                              fill={data.discountType ? "#4caf50" : "none"}
                              color={data.discountType ? "#4caf50" : "black"}
                              style={{ height: "20px", width: "20px" }}
                            />
                          </Button>

                          <Button
                            className="scanner_List_moreview"
                            onClick={() => {
                              setPrintOption(true);
                              setPrintAllData(false);
                              setOpenPrintModel(true);
                              handlePrintfind(data?.JobNo, false);
                            }}
                            // onClick={() => handlePrint(data?.JobNo, false)}
                          >
                            <Printer
                              style={{ height: "20px", width: "20px" }}
                            />
                          </Button>

                          <Button
                            className="scanner_List_moreview"
                            onClick={() => {
                              setPrintOption(false);
                              setOpenPrintModel(true);
                              handlePrintfind(data?.JobNo, false);
                            }}
                          >
                            <Share2 style={{ height: "20px", width: "20px" }} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  style={{
                    position: "fixed",
                    bottom: "60px",
                    right: "20px",
                    backgroundColor: "rgb(128 7 171)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "60px",
                    minWidth: "40px",
                  }}
                  // onClick={() => handlePrint("", true)}
                  onClick={() => {
                    setPrintAllData(true);
                    setOpenPrintModel(true);
                    handlePrintfind("", true);
                  }}
                >
                  <Printer />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        mode === "AllScanItem" && (
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
        )
      )}

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

      <Dialog
        open={openPrintModel}
        onClick={() => setOpenPrintModel(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent dividers>
          <div
            id="printSection"
            className="printDesign"
            ref={printRef}
            style={{ width: "100%" }}
          >
            <PritnModel activeDetail={printInfo} />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPrintModel(false)} color="error">
            Cancel
          </Button>
          <Button
            onClick={() => {
              printOption
                ? handlePrint(activeDetail?.JobNo, printAllData)
                : handleShare(printInfo?.JobNo, false);
            }}
            style={{ backgroundColor: "#5e08b6", color: "white" }}
          >
            {printOption ? "Download" : "Share"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* <div
        id="printSection"
        className="printDesign"
        ref={printRef}
        style={{ width: "100%" }}
      >
        <PritnModel activeDetail={printInfo} />
      </div> */}
    </div>
  );
};

export default Scanner;

// import React, { useCallback, useEffect, useRef, useState } from "react";
// import "./Scanner.scss";
// import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
// import { ArrowDown, Printer } from "lucide-react";
// import { showToast } from "../../../Utils/Tostify/ToastManager";
// import { CallApi } from "../../../API/CallApi/CallApi";
// import LoadingBackdrop from "../../../Utils/LoadingBackdrop";
// import html2pdf from "html2pdf.js";
// import PritnModel from "./PritnModel/PritnModel";

// const Scanner = () => {
//   const [scannedData, setScannedData] = useState([]);
//   const [mode, setMode] = useState("qr");
//   const [manualInput, setManualInput] = useState("");
//   const [activeDetail, setActiveDetail] = useState(null);
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [printInfo, setPrintInfo] = useState();
//   const [openPrintModel , setOpenPrintModel] = useState(false);
//   const activeCustomer = JSON.parse(
//     sessionStorage.getItem("curruntActiveCustomer")
//   );
//   const printRef = useRef(null);

//    useEffect(() => {
//       const savedScans = sessionStorage.getItem("AllScanJobData");
//       if (savedScans) {
//         try {
//           const parsed = JSON.parse(savedScans);
//           // Crucial change: Set scannedData with the PARSED array, not the raw string
//           if (Array.isArray(parsed)) {
//             // Add a check to ensure it's actually an array
//             setScannedData(parsed);
//             if (parsed.length > 0) {
//               setActiveDetail(parsed[0]);
//             }
//           } else {
//             // Handle cases where sessionStorage might contain invalid data
//             console.error(
//               "Invalid data found in sessionStorage for AllScanJobData:",
//               parsed
//             );
//             setScannedData([]); // Reset to empty array if data is invalid
//           }
//         } catch (e) {
//           console.error("Error parsing AllScanJobData from sessionStorage:", e);
//           setScannedData([]); // Reset to empty array on parsing error
//         }
//       }
//     }, []);

//   const addScan = useCallback(
//     async (jobNumber) => {
//       const list = JSON.parse(sessionStorage.getItem("AllScanJobData"));
//       const alreadyScanned = list?.some((item) => item?.JobNo === jobNumber);
//       if (alreadyScanned) {
//         showToast({
//           message: "Job already scanned",
//           bgColor: "#f1c40f",
//           fontColor: "#000",
//           duration: 4000,
//         });
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const Device_Token = sessionStorage.getItem("device_token");
//         const body = {
//           Mode: "GetScanJobData",
//           Token: Device_Token,
//           ReqData: JSON.stringify([
//             {
//               ForEvt: "GetScanJobData",
//               DeviceToken: Device_Token,
//               AppId: 3,
//               JobNo: jobNumber,
//               CustomerId: activeCustomer?.CustomerId,
//               IsVisitor: 0,
//             },
//           ]),
//         };
//         const response = await CallApi(body);
//         const jobData = response?.DT[0];
//         setIsLoading(false);

//         if (!jobData) {
//           setIsLoading(false);
//           setError("Invalid Job Number or No Data Found.");
//           return;
//         }

//         const formatted = {
//           JobNo: jobData.JobNo,
//           designNo: jobData.DesignNo,
//           price: jobData.Amount?.toFixed(0),
//           metal: jobData.TotalMetalCost,
//           diamoond: jobData.TotalDiamondCost,
//           colorStone: jobData.TotalColorstoneCost,
//           makingCharge: jobData.TotalMakingCost,
//           taxAmount: jobData.TotalTaxAmount?.toFixed(0),
//           netWeight: jobData.NetWt?.toFixed(3),
//           GrossWeight: jobData.GrossWt?.toFixed(3),
//           CartListId: jobData.CartListId,
//           WishListId: jobData.WishListId,
//           Category: jobData?.Category,
//           TotalMetalCost: jobData?.TotalMetalCost?.toFixed(0),
//           TotalDiamondCost: jobData?.TotalDiamondCost?.toFixed(0),
//           TotalColorstoneCost: jobData?.TotalColorstoneCost?.toFixed(0),
//           TotalMiscCost: jobData?.TotalMiscCost?.toFixed(0),
//           TotalMakingCost: (
//             jobData?.TotalMakingCost +
//             jobData?.TotalDiamondhandlingCost +
//             jobData?.TotalOtherCost
//           )?.toFixed(0),
//           DiamondWtP:
//             jobData?.DiaWt > 0 || jobData?.DiaPcs > 0
//               ? `${jobData.DiaWt > 0 ? jobData.DiaWt?.toFixed(3) + "ct" : ""}${
//                   jobData.DiaWt > 0 && jobData.DiaPcs > 0 ? " / " : ""
//                 }${jobData.DiaPcs > 0 ? jobData.DiaPcs + "pc" : ""}`
//               : null,
//           colorStoneWtP:
//             jobData?.CsWt > 0 || jobData?.CsPcs > 0
//               ? `${jobData?.CsWt > 0 ? jobData.CsWt?.toFixed(3) + "ct" : ""}${
//                   jobData?.CsWt > 0 && jobData?.CsPcs > 0 ? " / " : ""
//                 }${jobData?.CsPcs > 0 ? jobData.CsPcs + "pc" : ""}`
//               : null,
//           MiscWtP:
//             jobData?.MiscWt > 0 || jobData?.MiscPcs > 0
//               ? `${
//                   jobData?.MiscWt > 0 ? jobData.MiscWt?.toFixed(3) + "gm" : ""
//                 }${jobData?.MiscWt > 0 && jobData?.MiscPcs > 0 ? " / " : ""}${
//                   jobData?.MiscPcs > 0 ? jobData.MiscPcs + "pc" : ""
//                 }`
//               : null,
//           MetalTypeTitle: `${
//             jobData?.MetalPurity +
//             " " +
//             jobData?.MetalTypeName +
//             " " +
//             jobData?.MetalColorName
//           }`,
//           status: "Scanned",
//           image: `${jobData.CDNDesignImageFol}${jobData.ImageName}`, // "1/281165"
//           isInCartList: jobData.IsInCartList, // NEW
//           isInWishList: jobData.IsInWishList, // NEW
//         };
//         setScannedData((prevScannedData) => {
//           const currentScans = Array.isArray(prevScannedData)
//             ? prevScannedData
//             : [];
//           const newUpdatedData = [
//             formatted,
//             ...currentScans.filter((j) => j.JobNo !== formatted.JobNo),
//           ];
//           sessionStorage.setItem(
//             "AllScanJobData",
//             JSON.stringify(newUpdatedData)
//           );
//           return newUpdatedData;
//         });
//         setActiveDetail(formatted);
//         setIsExpanded(true);
//         setError(null);
//       } catch (err) {
//         setIsLoading(false);
//         console.error("Error during scan", err);
//         showToast({
//           message: "Invalid Job",
//           bgColor: "#f13f3f",
//           fontColor: "#fff",
//           duration: 5000,
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [activeCustomer]
//   );

//   const handleManualSave = () => {
//     if (manualInput.trim()) {
//       addScan(manualInput.trim());
//       setManualInput("");
//     }
//   };

//   const handlePrintfind = (data, allData) => {
//      const savedScans = JSON.parse(sessionStorage.getItem("AllScanJobData"));
//     const matchedArray = savedScans?.filter((item) => item.JobNo === data);
//     if (allData) {
//       setPrintInfo(savedScans);
//     } else {
//       setPrintInfo(matchedArray);
//     }
//   }
//   const handlePrint = (data, allData) => {
//     const savedScans = JSON.parse(sessionStorage.getItem("AllScanJobData"));
//     const matchedArray = savedScans?.filter((item) => item.JobNo === data);
//     if (allData) {
//       setPrintInfo(savedScans);
//     } else {
//       setPrintInfo(matchedArray);
//     }
//     const element = document.getElementById("printSection");
//     const height = allData
//       ? savedScans?.length >= 2
//         ? savedScans?.length >= 3
//           ? savedScans?.length * 170
//           : savedScans?.length * 190
//         : 250
//       : 300;

//     const opt = {
//       margin: [5, 5, 5, 5],
//       filename: "estimate.pdf",
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: {
//         unit: "mm",
//         format: [250, height],
//         orientation: "portrait",
//       },
//     };

//     html2pdf()
//       .set(opt)
//       .from(element)
//       .outputPdf("blob")
//       .then((blob) => {
//         const fileName = "estimate.pdf";
//         if (window.flutter_inappwebview) {
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             const base64data = reader.result.split(",")[1];
//             window.flutter_inappwebview.callHandler(
//               "downloadPDF",
//               base64data,
//               fileName
//             );
//           };
//           reader.readAsDataURL(blob);
//         } else {
//           const link = document.createElement("a");
//           link.href = URL.createObjectURL(blob);
//           link.download = fileName;
//           document.body.appendChild(link);
//           link.click();
//           link.remove();
//         }
//       });
//   };

//   const renderCollapsedTop = () =>
//     activeDetail && (
//       <div
//         className="top-detail-card collapsed"
//         onClick={() => setIsExpanded(true)}
//       >
//         <div className="left">
//           <strong>{activeDetail.jobNumber}</strong>
//           <p>₹{activeDetail.price}</p>
//         </div>
//         <div className="right">Tap to open</div>
//       </div>
//     );

//   const renderExpandedTop = () =>
//     activeDetail && (
//       <div className="top-detail-card_Big expanded">
//         <div style={{ padding: "5px" }}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-around",
//               marginTop: "10px",
//             }}
//           >
//             <Button
//               className="scanner_List_moreview"
//               onClick={() => {
//                 setOpenPrintModel(true);
//                 handlePrintfind('', true);
//               }}
//             >
//               <Printer />
//             </Button>
//           </div>
//         </div>
//       </div>
//     );

//   return (
//     <div className="scanner-container">
//       <LoadingBackdrop isLoading={isLoading} />
//       <div className="manual-input">
//         <input
//           type="text"
//           value={manualInput}
//           onChange={(e) => setManualInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               handleManualSave();
//             }
//           }}
//           placeholder="Enter job number"
//         />
//         <button onClick={handleManualSave}>Save</button>
//       </div>

//       {error && mode != "AllScanItem" && (
//         <p className="error-message">{error}</p>
//       )}

//       {activeDetail &&
//         mode != "AllScanItem" &&
//         (isExpanded ? renderExpandedTop() : renderCollapsedTop())}

//       <Dialog open={openPrintModel} onClick={() => setOpenPrintModel(false)} maxWidth="md" fullWidth>
//         <DialogContent dividers>
//           <div
//             id="printSection"
//             className="printDesign"
//             ref={printRef}
//             style={{ width: "100%" }}
//           >
//             <PritnModel activeDetail={printInfo} />
//           </div>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => handlePrint(activeDetail?.JobNo, false)}>Save</Button>
//           <Button onClick={() => setOpenPrintModel(false)} color="error">
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default Scanner;
