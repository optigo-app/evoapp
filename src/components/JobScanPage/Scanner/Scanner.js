import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  ArrowDown,
  ArrowUp,
  Keyboard,
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

const Scanner = () => {
  const [scannedData, setScannedData] = useState([]);
  const [mode, setMode] = useState("qr");
  const [manualInput, setManualInput] = useState("");
  const [activeDetail, setActiveDetail] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountProductData, setDiscoutProductData] = useState();

  const activeCustomer = JSON.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );

  useEffect(() => {
    const savedScans = sessionStorage.getItem("AllScanJobData");
    if (savedScans) {
      const parsed = JSON.parse(savedScans);
      setScannedData(parsed);
      if (parsed.length > 0) setActiveDetail(parsed[0]);
    }

    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia
    ) {
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
    } else {
      console.warn("Media devices are not supported on this browser.");
      setError("Camera access is not supported in this environment.");
    }
  }, []);

  const addScan = async (jobNumber) => {
    try {
      const Device_Token = sessionStorage.getItem("device_token");
      const body = {
        Mode: "GetScanJobData",
        Token: `"${Device_Token}"`,
        ReqData: `[{"ForEvt":"GetScanJobData","DeviceToken":"${Device_Token}","AppId":"3","JobNo":"${jobNumber}"}]`,
      };
      const response = await CallApi(body);
      const jobData = response?.DT[0];
      console.log("job scan response data", response);
      if (!jobData) {
        setError("Invalid Job Number or No Data Found.");
        return;
      }

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
        DiamondWtP: `${jobData?.DiaWt}${
          jobData?.DiaPcs !== 0 ? " / " + jobData.DiaPcs + "pcs" : ""
        }`,
        colorStoneWtP: `${jobData?.CsWt}${
          jobData?.CsPcs !== 0 ? " / " + jobData.CsPcs + "pcs" : ""
        }`,
        MiscWtP: `${jobData?.DiaWt}${
          jobData?.DiaPcs !== 0 ? " / " + jobData.DiaPcs : ""
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
      console.error("Error during scan", err);
      showToast({
        message: "Invalid Job",
        bgColor: "#f13f3f",
        fontColor: "#fff",
        duration: 5000,
      });
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
              JobNo: current.jobNumber,
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
              JobNo: current.jobNumber,
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
              JobNo: current.jobNumber,
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
              JobNo: current.jobNumber,
              CustomerId: activeCustomer.CustomerId || 0,
              IsVisitor: activeCustomer.IsVisitor || 0,
              DiscountOnId: 0,
              Discount: 0,
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
      item.jobNumber === updatedItem.jobNumber ? updatedItem : item
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
        <div style={{ padding: "5px" }}>
          <div className="header">
            <span>
              {activeDetail.JobNo} ({activeDetail?.designNo})
            </span>
          </div>
          <div>
            <img
              src={activeDetail?.image}
              onError={(e) => (e.target.src = PlaceHolderImg)}
              style={{ width: "100%" }}
            />
          </div>
          <div className="body">
            <div>
              <p className="showData_price_title">Actual Price</p>
              <p className="showData_price_deatil"> ₹{activeDetail.price}</p>
            </div>
            {activeDetail?.discountedPrice && (
              <div>
                <p
                  style={{
                    margin: "5px 0px",
                    color: "#988d8d",
                    fontSize: "15px",
                  }}
                >
                  Discounted Price
                </p>
                <p
                  style={{
                    margin: "5px 0px",
                    fontSize: "20px",
                    fontWeight: 600,
                  }}
                >
                  {" "}
                  ₹{activeDetail.discountedPrice}
                </p>
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex" }}>
                <div style={{ width: "33.33%" }}>
                  <p className="info_main_section">GW : </p>
                  <span className="info_main_section_span">
                    {activeDetail.GrossWeight} Grms
                  </span>
                </div>
                <div style={{ width: "33.33%" }}>
                  <p className="info_main_section">NetW :</p>
                  <span className="info_main_section_span">
                    {activeDetail.netWeight} Grms
                  </span>
                </div>
                <div style={{ width: "33.33%" }}>
                  <p className="info_main_section">Diamond: </p>
                  <span className="info_main_section_span">
                    ₹{activeDetail.DiamondWtP}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex" }}>
                <div style={{ width: "33.33%" }}>
                  <p className="info_main_section">CS W/P : </p>
                  <span className="info_main_section_span">
                    ₹{activeDetail.colorStoneWtP}
                  </span>
                </div>
                <div style={{ width: "33.33%" }}>
                  <p className="info_main_section">MiscWtP: </p>
                  <span className="info_main_section_span">
                    ₹{activeDetail.MiscWtP}
                  </span>
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
            <div
              className="scanner_List_moreview"
              onClick={() => toggleWishlist("", false)}
            >
              <Heart
                fill={activeDetail.isInWishList ? "#ff3366" : "none"}
                color={activeDetail.isInWishList ? "#ff3366" : "black"}
              />
              <p>Wishlist</p>
            </div>

            <div
              className="scanner_List_moreview"
              onClick={() => toggleCart("", false)}
            >
              <ShoppingCart
                fill={activeDetail.isInCartList ? "#4caf50" : "none"}
                color={activeDetail.isInCartList ? "#4caf50" : "black"}
              />
              <p>Cart</p>
            </div>

            <div
              className="scanner_List_moreview"
              onClick={() => {
                setDiscountModalOpen(true);
                setDiscoutProductData(activeDetail);
              }}
            >
              <Percent />
              <p>Discount</p>
            </div>
          </div>
        </div>
      </div>
    );

  const [expandedItems, setExpandedItems] = useState([]);

  console.log("scannedDatascannedData", scannedData);

  return (
    <div className="scanner-container">
      <DiscountModal
        discountModalOpen={discountModalOpen}
        setDiscountModalOpen={setDiscountModalOpen}
        activeDetail={discountProductData}
        updateScannedAndSession={updateScannedAndSession}
        showToast={showToast}
      />
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

      {scannedData.length !== 0 && mode === "AllScanItem" && (
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
                        <h4 style={{ margin: "5px 2px" }}>
                          {data.jobNumber}({data?.designNo})
                        </h4>
                        <h4 style={{ margin: "5px 2px" }}>₹{data.price}</h4>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p style={{ margin: "0px" }}>{data.Category}</p>
                        <div style={{ fontSize: "1.5rem" }}>
                          {isExpanded ? (
                            <ArrowUp
                              style={{
                                height: "20px",
                                width: "20px",
                                borderRadius: "50px",
                                color: "#b3b2b2",
                              }}
                            />
                          ) : (
                            <ArrowDown
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

                  {isExpanded && (
                    <div
                      style={{
                        padding: "5px",
                        borderTop: "1px solid rgb(221 221 221 / 42%)",
                      }}
                    >
                      <div>
                        <img
                          src={data?.image}
                          onError={(e) => (e.target.src = PlaceHolderImg)}
                          style={{
                            width: "100%",
                            objectFit: "contain",
                            minHeight: "300px",
                          }}
                        />
                      </div>

                      <div className="body">
                        <div>
                          <p className="showData_price_title">Actual Price</p>
                          <p className="showData_price_deatil">
                            {" "}
                            ₹{data.price}
                          </p>
                        </div>
                        {data?.discountedPrice && (
                          <div>
                            <p
                              style={{
                                margin: "5px 0px",
                                color: "#988d8d",
                                fontSize: "15px",
                              }}
                            >
                              Discounted Price
                            </p>
                            <p
                              style={{
                                margin: "5px 0px",
                                fontSize: "20px",
                                fontWeight: 600,
                              }}
                            >
                              {" "}
                              ₹{data.discountedPrice}
                            </p>
                          </div>
                        )}
                        <p
                          className="desc_metal_line"
                          style={{
                            fontWeight: 600,
                            margin: "15px 0px 10px 0px ",
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
                            <div style={{ width: "33.33%" }}>
                              <p className="info_main_section">GW : </p>
                              <span className="info_main_section_span">
                                {data.GrossWeight} Grms
                              </span>
                            </div>
                            <div style={{ width: "33.33%" }}>
                              <p className="info_main_section">NetW :</p>
                              <span className="info_main_section_span">
                                {data.netWeight} Grms
                              </span>
                            </div>
                            <div style={{ width: "33.33%" }}>
                              <p className="info_main_section">Diamond: </p>
                              <span className="info_main_section_span">
                                ₹{data.DiamondWtP}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex" }}>
                            <div style={{ width: "33.33%" }}>
                              <p className="info_main_section">CS W/P : </p>
                              <span className="info_main_section_span">
                                ₹{data.colorStoneWtP}
                              </span>
                            </div>
                            <div style={{ width: "33.33%" }}>
                              <p className="info_main_section">MiscWtP: </p>
                              <span className="info_main_section_span">
                                ₹{data.MiscWtP}
                              </span>
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
                        <div
                          className="scanner_List_moreview"
                          onClick={() => toggleWishlist(data, true)}
                        >
                          <Heart
                            fill={data.isInWishList ? "#ff3366" : "none"}
                            color={data.isInWishList ? "#ff3366" : "black"}
                          />
                          <p>Wishlist</p>
                        </div>

                        <div
                          className="scanner_List_moreview"
                          onClick={() => toggleCart(data, true)}
                        >
                          <ShoppingCart
                            fill={data.isInCartList ? "#4caf50" : "none"}
                            color={data.isInCartList ? "#4caf50" : "black"}
                          />
                          <p>Cart</p>
                        </div>

                        <div
                          className="scanner_List_moreview"
                          onClick={() => {
                            setDiscountModalOpen(true);
                            setDiscoutProductData(data);
                          }}
                        >
                          <Percent />
                          <p>Discount</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
    </div>
  );
};

export default Scanner;
