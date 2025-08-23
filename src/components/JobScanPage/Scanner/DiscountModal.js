import { CallApi } from "../../../API/CallApi/CallApi";
import {
  Modal,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Button,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { CircleX, IndianRupee, Percent } from "lucide-react";
import { useEffect, useState } from "react";

const DiscountModal = ({
  discountModalOpen,
  setDiscountModalOpen,
  activeDetail,
  updateScannedAndSession,
  showToast,
}) => {
  const [discountType, setDiscountType] = useState("flat"); // "flat" | "percentage" | "direct"
  const [discountValue, setDiscountValue] = useState(""); // numeric input
  const [directPriceInput, setDirectPriceInput] = useState(""); // numeric input
  const [calculatedPrice, setCalculatedPrice] = useState(
    activeDetail?.price || 0
  );

  const originalPrice = activeDetail?.price || 0;
  const curruntActiveCustomer = JSON.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );

  useEffect(() => {
    if (!discountModalOpen) return;
    setDiscountType("flat");
    setDiscountValue("");
    setDirectPriceInput("");
    setCalculatedPrice(originalPrice);

    const {
      discountType: adType,
      discountValue: adValue,
      discountedPrice: adPrice,
    } = activeDetail ?? {};

    if (adType === undefined && adValue === undefined && adPrice === undefined)
      return;
    if (adType === "direct") {
      setDirectPriceInput(String(adPrice ?? ""));
      setCalculatedPrice(adPrice ?? originalPrice);
      setDiscountValue(Number(adValue ?? 0));
      return;
    }
    if (adType === "flat" || adType === "percentage") {
      setDiscountType(adType);
      setDiscountValue(Number(adValue ?? 0));
      setCalculatedPrice(adPrice ?? originalPrice);
    }
  }, [discountModalOpen, activeDetail?.JobNo]);

  useEffect(() => {
    if (directPriceInput !== "") {
      const directPrice = Number(directPriceInput);
      const diff = originalPrice - directPrice;
      if (diff > 0) {
        // must be strictly positive
        setDiscountValue(diff);
        setCalculatedPrice(directPrice.toFixed(0));
      } else {
        setDiscountValue(0);
        setCalculatedPrice(originalPrice);
      }
    } else {
      const discount = Number(discountValue);
      let finalPrice = originalPrice;

      if (discountType === "flat") {
        finalPrice = originalPrice - discount;
      } else if (discountType === "percentage") {
        finalPrice = originalPrice - (originalPrice * discount) / 100;
      }

      setCalculatedPrice(finalPrice > 0 ? finalPrice.toFixed(0) : 0);
    }
  }, [discountValue, discountType, originalPrice, directPriceInput]);

  const handleSaveOnly = () => {
    const noDiscount =
      directPriceInput === "" &&
      (discountValue === "" || Number(discountValue) === 0);

    if (noDiscount) {
      const updated = {
        ...activeDetail,
        discountValue: "",
        discountType: "",
        discountedPrice: "",
      };
      updateScannedAndSession(updated);

      showToast({
        message: "Discount removed",
        bgColor: "#f44336",
        fontColor: "#fff",
        duration: 5000,
      });

      setDiscountModalOpen(false);
      return;
    }
    const updated = {
      ...activeDetail,
      discountValue: Number(discountValue),
      discountType: directPriceInput !== "" ? "direct" : discountType,
      discountedPrice: calculatedPrice,
    };
    updateScannedAndSession(updated);

    showToast({
      message: "Discount saved",
      bgColor: "#2196f3",
      fontColor: "#fff",
      duration: 5000,
    });

    setDiscountModalOpen(false);
  };

  // const handleApplyDiscount = async () => {
  //   const Device_Token = sessionStorage.getItem("device_token");
  //   const discount = Number(discountValue);
  //   const hasDiscount = discount > 0;

  //   const body = {
  //     Mode: "AddToCart",
  //     Token: Device_Token,
  //     ReqData: JSON.stringify([
  //       {
  //         ForEvt: "AddToCart",
  //         DeviceToken: Device_Token,
  //         AppId: 3,
  //         JobNo: activeDetail?.JobNo,
  //         CustomerId: curruntActiveCustomer?.CustomerId,
  //         IsVisitor: curruntActiveCustomer?.IsVisitor,
  //         DiscountOnId: hasDiscount
  //           ? directPriceInput !== ""
  //             ? 1
  //             : discountType === "flat"
  //             ? 1
  //             : 0
  //           : 0,
  //         Discount: hasDiscount ? discount : 0,
  //       },
  //     ]),
  //   };

  //   try {
  //     await CallApi(body);

  //     showToast({
  //       message: hasDiscount
  //         ? "Item added to cart with discount"
  //         : "Item added to cart",
  //       bgColor: "#4caf50",
  //       fontColor: "#fff",
  //       duration: 5000,
  //     });

  //     const updated = {
  //       ...activeDetail,
  //       isInCartList: 1,
  //       discountedPrice: hasDiscount ? calculatedPrice : originalPrice,
  //     };
  //     updateScannedAndSession(updated);
  //     setDiscountModalOpen(false);
  //   } catch (error) {
  //     console.error("Error applying discount", error);
  //     showToast({
  //       message: "Failed to add to cart",
  //       bgColor: "#f44336",
  //       fontColor: "#fff",
  //       duration: 5000,
  //     });
  //   }
  // };

  const maxDirectPrice = Math.max(originalPrice - 1, 0);
  const handleDirectPriceInput = (e) => {
    setDiscountType("flat");
    const cleaned = e.target.value.replace(/[^\d]/g, "");
    if (cleaned === "") {
      setDirectPriceInput("");
      setDiscountValue("");
      return;
    }
    let num = Number(cleaned);
    if (num > maxDirectPrice) num = maxDirectPrice;
    setDirectPriceInput(String(num));
    setDiscountValue("");
  };

  const maxFlatDiscount = Math.max(originalPrice - 1, 0);

  const handleDiscountChange = (e) => {
    let val = e.target.value;
    if (!/^\d*\.?\d*$/.test(val)) return;
    if (val === "") {
      setDiscountValue("");
      return;
    }
    if (val.startsWith(".")) {
      val = "0" + val;
    }
    if (discountType === "percentage") {
      const num = parseFloat(val);
      if (!Number.isNaN(num) && num > 100) {
        val = "100";
      }
    } else {
      const num = parseFloat(val);
      const maxFlatDiscount = Math.max(originalPrice - 1, 0);
      if (!Number.isNaN(num) && num > maxFlatDiscount) {
        val = String(maxFlatDiscount);
      }
    }
    setDiscountValue(val);
  };

  const handleClearDirect = () => {
    setDirectPriceInput("");
    setDiscountValue("");
    setCalculatedPrice(originalPrice);
  };

  const handleClearDiscount = () => {
    setDiscountValue("");
    // recalculation falls back to original price
    setCalculatedPrice(originalPrice);
  };
  return (
    <Modal open={discountModalOpen} onClose={() => setDiscountModalOpen(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          outline: "none",
          p: 3,
        }}
      >
        <div
          style={{ position: "absolute", right: "10px", top: "10px" }}
          onClick={() => setDiscountModalOpen(false)}
        >
          <CircleX style={{ color: "#5e08b6" }} />
        </div>

        <Typography variant="h6" gutterBottom>
          Apply Discount
        </Typography>
        <Typography variant="body2">
          <strong>Job No:</strong> {activeDetail?.JobNo}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Original Price:</strong> ₹{originalPrice}
        </Typography>

        <TextField
          label="Enter Final Price Directly (₹)"
          type="text" // use text so you control everything
          fullWidth
          value={directPriceInput}
          onChange={handleDirectPriceInput}
          onKeyDown={(e) => {
            if (
              [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "Tab",
              ].includes(e.key)
            )
              return;
            if (!/^\d$/.test(e.key)) e.preventDefault();
          }}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            max: maxDirectPrice,
          }}
          InputProps={{
            endAdornment:
              directPriceInput !== "" ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearDirect}>
                    <CircleX size={20} style={{ color: "#5e08b6" }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
          }}
          sx={{ my: 2, color: "red" }}
        />

        <ToggleButtonGroup
          value={discountType}
          exclusive
          onChange={(e, newVal) => {
            if (newVal && directPriceInput === "") {
              setDiscountType(newVal);
            }
            setDiscountValue("");
          }}
          fullWidth
          disabled={directPriceInput !== ""}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="flat" style={{ fontSize: "11px" }}>
            Amount(
            <IndianRupee style={{ height: "13px", width: "13px" }} />)
          </ToggleButton>
          <ToggleButton value="percentage" style={{ fontSize: "11px" }}>
            Percentage(
            <Percent style={{ height: "15px", width: "13px" }} />)
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label={discountType === "flat" ? "Discount (₹)" : "Discount (%)"}
          type="text"
          fullWidth
          readOnly={directPriceInput !== ""}
          value={discountValue === "" ? "" : discountValue}
          onChange={handleDiscountChange}
          inputProps={{
            inputMode: "decimal", // allows decimal point keypad
          }}
          InputProps={{
            endAdornment:
              discountValue !== "" ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearDiscount}>
                    <CircleX size={20} style={{ color: "#5e08b6" }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Total After Discount"
          value={`₹${calculatedPrice}`}
          fullWidth
          InputProps={{ readOnly: true }}
        />

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            style={{
              backgroundColor: "rgb(149 51 250)",
              color: "white",
            }}
            onClick={handleSaveOnly}
          >
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};
export default DiscountModal;
