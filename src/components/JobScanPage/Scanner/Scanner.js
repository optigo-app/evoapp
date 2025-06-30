import React, { useEffect, useRef, useState } from "react";
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
} from "@mui/material";
import {
  ArrowDown,
  ArrowUp,
  Keyboard,
  Printer,
  ScanLine,
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

  useEffect(() => {
    const savedScans = sessionStorage.getItem("AllScanJobData");
    if (savedScans) {
      const parsed = JSON.parse(savedScans);
      setScannedData(parsed);
      if (parsed.length > 0) setActiveDetail(parsed[0]);
    }
  }, []);

  const webcamRef = useRef(null);
  const [qrData, setQrData] = useState(null);
  const [scannedOnce, setScannedOnce] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setPermissionGranted(true);
      })
      .catch(() => setPermissionGranted(false));
  }, []);

  useEffect(() => {
    if (!permissionGranted || scannedOnce) return;
    const id = setInterval(scan, 700);
    return () => clearInterval(id);
  }, [permissionGranted, scannedOnce]);

  const BOX = 220;

  const scan = () => {
    const video = webcamRef.current?.video;
    if (!video || video.readyState !== 4 || scannedOnce) return;

    const vW = video.videoWidth;
    const vH = video.videoHeight;

    /* work in device-pixel pixels so cropping is exact */
    const boxSize = BOX * window.devicePixelRatio;
    const startX = Math.round((vW - boxSize) / 2);
    const startY = Math.round((vH - boxSize) / 2);

    /* draw only the region of interest */
    const canvas = document.createElement("canvas");
    canvas.width = boxSize;
    canvas.height = boxSize;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      video,
      startX,
      startY,
      boxSize,
      boxSize, // src (video) rect
      0,
      0,
      boxSize,
      boxSize // dst (canvas) rect
    );

    const t0 = performance.now();
    const imageData = ctx.getImageData(0, 0, boxSize, boxSize);
    const code = jsQR(imageData.data, boxSize, boxSize, {
      inversionAttempts: "attemptBoth",
    });
    const dt = (performance.now() - t0).toFixed(1);

    if (code?.data) {
      const jobNo = code.data.trim();
      if (jobNo.length > 3) {
        setScannedOnce(true);
        setIsLoading(true);
        addScan(jobNo);
      }
    }
  };

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

  const addScan = async (jobNumber) => {
    const alreadyScanned = scannedData.some((item) => item.JobNo === jobNumber);
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
        Token: `"${Device_Token}"`,
        ReqData: `[{"ForEvt":"GetScanJobData","DeviceToken":"${Device_Token}","AppId":"3","JobNo":"${jobNumber}"}]`,
      };
      const response = await CallApi(body);
      const jobData = response?.DT[0];
      setIsLoading(false);
      if (!jobData) {
        setIsLoading(false);
        setError("Invalid Job Number or No Data Found.");
        return;
      }

      console.log("jobDatajobDatajobDatajobData", jobData);

      const formatted = {
        JobNo: jobData.JobNo,
        designNo: jobData.DesignNo,
        price: jobData.Amount,
        price: jobData.Amount,
        metal: jobData.TotalMetalCost,
        diamoond: jobData.TotalDiamondCost,
        colorStone: jobData.TotalColorstoneCost,
        makingCharge: jobData.TotalMakingCost,
        taxAmount: jobData.TotalOtherCost,
        netWeight: jobData.NetWt,
        GrossWeight: jobData.GrossWt,
        CartListId: jobData.CartListId,
        WishListId: jobData.WishListId,
        Category: jobData?.Category,
        DiamondWtP: `
        ${jobData?.DiaWt !== 0 ? +jobData.DiaWt + "ct" : ""}${
          jobData?.DiaPcs !== 0 ? " / " + jobData.DiaPcs + "pc" : ""
        }`,
        colorStoneWtP: `
        ${jobData?.CsWt !== 0 ? +jobData.CsWt + "ct" : ""}${
          jobData?.CsPcs !== 0 ? " / " + jobData.CsPcs + "pc" : ""
        }`,
        MiscWtP: `${jobData?.DiaWt !== 0 ? +jobData.DiaWt + "gm" : ""}${
          jobData?.DiaPcs !== 0 ? " / " + jobData.DiaPcs + "pc" : ""
        }`,
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

      const updatedData = [
        formatted,
        ...scannedData.filter((j) => j.JobNo !== formatted.JobNo),
      ];

      setScannedData(updatedData);
      setActiveDetail(formatted);
      setIsExpanded(true);
      sessionStorage.setItem("AllScanJobData", JSON.stringify(updatedData));
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
      setTimeout(() => {
        setScannedOnce(false);
      }, 1500);
    }
  };

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
              DiscountOnId: 0,
              Discount: 0,
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
    element.style.display = "block";
    const opt = {
      margin: [5, 5, 5, 5],
      filename: "estimate.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: [
          250,
          allData
            ? savedScans?.length >= 2
              ? savedScans?.length * 130
              : 250
            : 250,
        ],
        orientation: "portrait",
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf("blob")
      .then((blob) => {
        const fileName = "estimate.pdf";
        element.style.display = "none";
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

  //  const handleShare = async () => {
  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: "temon",
  //         text: `Check out this product: Temp`,
  //         url: window.location.href, // or product-specific URL
  //       });
  //       console.log('Shared successfully');
  //     } catch (error) {
  //       console.error('Error sharing:', error);
  //     }
  //   } else {
  //     alert('Share not supported on this browser');
  //   }
  // };

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

  console.log("activeDetail", activeDetail);

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
              <span
                className={
                  activeDetail?.discountedPrice
                    ? "showData_price_deatil_withdiscount"
                    : "showData_price_deatil"
                }
              >
                ₹ {activeDetail.price}
              </span>
              {activeDetail?.discountedPrice && (
                <div>
                  <p
                    style={{
                      margin: "0px",
                      fontSize: "15px",
                      fontWeight: 600,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                    className="showData_price_deatil"
                  >
                    {" "}
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
                  <div style={{ width: "40%" }}>
                    <p className="info_main_section">Dia. WT: </p>
                    <span className="info_main_section_span">
                      {activeDetail.DiamondWtP}{" "}
                    </span>
                  </div>
                  <div style={{ width: "30%" }}>
                    <p className="info_main_section">GWT : </p>
                    <span className="info_main_section_span">
                      {activeDetail.GrossWeight}{" "}
                      <span style={{ fontSize: "14px" }}>gm</span>
                    </span>
                  </div>
                  <div style={{ width: "30%" }}>
                    <p className="info_main_section">NWT :</p>
                    <span className="info_main_section_span">
                      {activeDetail.netWeight}{" "}
                      <span style={{ fontSize: "14px" }}>gm</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex" }}>
                  <div style={{ width: "40%" }}>
                    <p className="info_main_section">CS WT : </p>
                    <span className="info_main_section_span">
                      {activeDetail.colorStoneWtP}
                    </span>
                  </div>
                  <div style={{ width: "40%" }}>
                    <p className="info_main_section">Misc: </p>
                    <span className="info_main_section_span">
                      {activeDetail.MiscWtP}
                    </span>
                  </div>
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
              />
            </Button>

            <Button
              className="scanner_List_moreview"
              onClick={() => {
                setDiscountModalOpen(true);
                setDiscoutProductData(activeDetail);
              }}
            >
              <Percent
                fill={activeDetail.discountType ? "#4caf50" : "none"}
                color={activeDetail.discountType ? "#4caf50" : "black"}
              />
            </Button>

            <Button
              className="scanner_List_moreview"
              onClick={() => handlePrint(activeDetail?.JobNo, false)}
            >
              <Printer />
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

      {/* {scannedData?.length !== 0 && (
        <p className="ProductScanTitle">Product Scanner</p>
      )} */}

      {mode === "qr" ? (
        <div className="scanner-wrapper" style={{ "--box": `${BOX}px` }}>
          {permissionGranted === null && (
            <p className="status">🔄 Checking camera…</p>
          )}
          {permissionGranted === false && (
            <p className="status">
              ❌ Camera permission denied.{" "}
              <button onClick={retryPermission}>Retry</button>
            </p>
          )}

          {permissionGranted && (
            <div className="camera-container camera-45">
              <Webcam
                ref={webcamRef}
                audio={false}
                playsInline
                muted={true}
                className="camera-feed"
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "environment",
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  advanced: [{ zoom: 1.5 }], // 👈 try zoom level 2x
                }}
              />
              <div className="overlay">
                <div className="ov top" />
                <div className="ov bottom" />
                <div className="ov left" />
                <div className="ov right" />
                <div className="scanner-box" />
              </div>
            </div>
          )}

          {/* feedback below the camera */}
          {/* {isLoading && <p className="status">Scanning…</p>} */}
          {error && (
            <p className="status" style={{ color: "#ff6961" }}>
              {error}
            </p>
          )}
          {/* <h1 className="status">
            Last scan: <strong>{activeDetail?.JobNo}</strong>
          </h1> */}
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
                                }}
                                className="showData_price_deatil"
                              >
                                {" "}
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
                                <div style={{ width: "40%" }}>
                                  <p className="info_main_section">Dia. WT: </p>
                                  <span className="info_main_section_span">
                                    {data.DiamondWtP}
                                  </span>
                                </div>
                                <div style={{ width: "30%" }}>
                                  <p className="info_main_section">GWT : </p>
                                  <span className="info_main_section_span">
                                    {data.GrossWeight}{" "}
                                    <span style={{ fontSize: "14px" }}>gm</span>
                                  </span>
                                </div>
                                <div style={{ width: "30%" }}>
                                  <p className="info_main_section">NWT :</p>
                                  <span className="info_main_section_span">
                                    {data.netWeight}{" "}
                                    <span style={{ fontSize: "14px" }}>gm</span>
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: "flex" }}>
                                <div style={{ width: "40%" }}>
                                  <p className="info_main_section">CS WT : </p>
                                  <span className="info_main_section_span">
                                    {data.colorStoneWtP}
                                  </span>
                                </div>
                                <div style={{ width: "40%" }}>
                                  <p className="info_main_section">Misc: </p>
                                  <span className="info_main_section_span">
                                    {data.MiscWtP}
                                  </span>
                                </div>
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
                            />
                          </Button>

                          <Button
                            className="scanner_List_moreview"
                            onClick={() => toggleCart(data, true)}
                          >
                            <ShoppingCart
                              fill={data.isInCartList ? "#4caf50" : "none"}
                              color={data.isInCartList ? "#4caf50" : "black"}
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
                            />
                          </Button>

                          <Button
                            className="scanner_List_moreview"
                            onClick={() => handlePrint(data?.JobNo, false)}
                          >
                            <Printer />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  style={{
                    position: "fixed",
                    bottom: "80px",
                    right: "30px",
                    backgroundColor: "rgb(128 7 171)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "60px",
                  }}
                  onClick={() => handlePrint("", true)}
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
            <Tally3 />
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

      <div
        id="printSection"
        className="printDesign"
        ref={printRef}
        style={{ width: "100%" }}
      >
        <PritnModel activeDetail={printInfo} />
      </div>
    </div>
  );
};

export default Scanner;
