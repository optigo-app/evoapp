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
import { ShoppingBag } from "lucide-react";
import { showToast } from "../../../Utils/Tostify/ToastManager";
import { Heart } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Percent } from "lucide-react";
import { CallApi } from "../../../API/CallApi/CallApi";
import DiscountModal from "./DiscountModal";

const Scanner = () => {
  const [scannedData, setScannedData] = useState([]);
  const [mode, setMode] = useState("qr");
  const [manualInput, setManualInput] = useState("");
  const [activeDetail, setActiveDetail] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountType, setDiscountType] = useState("flat"); // 'flat' or 'percentage'
  const [discountValue, setDiscountValue] = useState();
  const [calculatedPrice, setCalculatedPrice] = useState();

  const activeCustomer = JSON.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );

  useEffect(() => {
    if (!activeDetail) return;

    const original = Number(activeDetail.price);
    const discount = Number(discountValue);

    let final = 0;
    if (discountType === "flat") {
      final = original - discount;
    } else {
      final = original - (original * discount) / 100;
    }

    setCalculatedPrice(final > 0 ? final.toFixed(2) : 0);
  }, [discountValue, discountType, activeDetail]);

  useEffect(() => {
    const savedScans = sessionStorage.getItem("AllScanJobData");
    if (savedScans) {
      const parsed = JSON.parse(savedScans);
      setScannedData(parsed);
      if (parsed.length > 0) setActiveDetail(parsed[0]);
    }

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
        CartListId: jobData.CartListId,
        WishListId: jobData.WishListId,
        status: "Scanned",
        image: `${jobData.CDNDesignImageFol}${jobData.ImageName}`,
        isInCartList: jobData.IsInCartList, // NEW
        isInWishList: jobData.IsInWishList, // NEW
      };

      const updatedData = [
        formatted,
        ...scannedData.filter((j) => j.jobNumber !== formatted.jobNumber),
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

  const toggleWishlist = async () => {
    const Device_Token = sessionStorage.getItem("device_token");
    const current = activeDetail;

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
              AppId: 3,
              CartWishId: current.WishListId || 0,
              IsRemoveAll: 0,
              CustomerId: activeCustomer?.CustomerId || 0,
              IsVisitor: activeCustomer?.IsVisitor || 0,
            },
          ]),
        };

        const response = await CallApi(body);
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
  const toggleCart = async () => {
    const Device_Token = sessionStorage.getItem("device_token");
    const current = activeDetail;

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
              IsRemoveAll: 0,
              CustomerId: activeCustomer.CustomerId || 0,
              IsVisitor: activeCustomer.IsVisitor || 0,
            },
          ]),
        };
        const response = await CallApi(body);
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
        <div style={{ padding: "1rem" }}>
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "10px",
          }}
        >
          <div className="scanner_List_moreview" onClick={toggleWishlist}>
            <Heart
              fill={activeDetail.isInWishList ? "#ff3366" : "none"}
              color={activeDetail.isInWishList ? "#ff3366" : "black"}
            />
            <p>Wishlist</p>
          </div>

          <div className="scanner_List_moreview" onClick={toggleCart}>
            <ShoppingCart
              fill={activeDetail.isInCartList ? "#4caf50" : "none"}
              color={activeDetail.isInCartList ? "#4caf50" : "black"}
            />
            <p>Cart</p>
          </div>

          <div
            className="scanner_List_moreview"
            onClick={() => setDiscountModalOpen(true)}
          >
            <Percent />
            <p>Discount</p>
          </div>
        </div>
      </div>
    );

  const handleApplyDiscount = async () => {
    const Device_Token = sessionStorage.getItem("device_token");
    const discount = Number(discountValue);
    const body = {
      Mode: "AddToCart",
      Token: Device_Token,
      ReqData: JSON.stringify([
        {
          ForEvt: "AddToCart",
          DeviceToken: Device_Token,
          AppId: 3,
          JobNo: activeDetail?.jobNumber,
          CustomerId: activeDetail?.CustomerId,
          IsVisitor: activeDetail?.IsVisitor,
          DiscountOnId: discountType == "flat" ? 1 : 0,
          Discount: discount ?? 0,
        },
      ]),
    };

    try {
      await CallApi(body);
      showToast({
        message: "Item added to cart with discount",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 5000,
      });

      const updated = {
        ...activeDetail,
        isInCartList: 1,
        discountedPrice: calculatedPrice,
      };
      updateScannedAndSession(updated);
      setDiscountModalOpen(false);
    } catch (error) {
      console.error("Error applying discount", error);
      showToast({
        message: "Failed to apply discount",
        bgColor: "#f44336",
        fontColor: "#fff",
        duration: 5000,
      });
    }
  };

  return (
    <div className="scanner-container">
      <DiscountModal
        discountModalOpen={discountModalOpen}
        setDiscountModalOpen={setDiscountModalOpen}
        activeDetail={activeDetail}
        updateScannedAndSession={updateScannedAndSession}
        showToast={showToast}
      />

      {/* <Modal
        open={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 350,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            outline: 'none',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Apply Discount
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Job No:</strong> {activeDetail?.jobNumber}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Original Price:</strong> ₹{activeDetail?.price}
          </Typography>

          <ToggleButtonGroup
            value={discountType}
            exclusive
            onChange={(e, newType) => newType && setDiscountType(newType)}
            fullWidth
            sx={{ my: 2 }}
          >
            <ToggleButton value="flat">Flat Amount</ToggleButton>
            <ToggleButton value="percentage">Percentage</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label={discountType === "flat" ? "Discount (₹)" : "Discount (%)"}
            type="number"
            value={discountValue === 0 ? "" : discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" gutterBottom>
            <strong>Discounted Price:</strong> ₹{calculatedPrice}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyDiscount}
            >
              Save & Add to Cart
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDiscountModalOpen(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal> */}

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
            placeholder="Enter job number"
          />
          <button onClick={handleManualSave}>Save</button>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {activeDetail &&
        (isExpanded ? renderExpandedTop() : renderCollapsedTop())}

      {scannedData.length !== 0 && mode == "AllScanItem" && (
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
            onClick={() => setMode("AllScanItem")}
            className={mode === "AllScanItem" ? "active" : ""}
            variant="text"
          >
            All Scan Item
          </Button>
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
