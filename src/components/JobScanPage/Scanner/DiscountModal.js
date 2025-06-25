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
} from "@mui/material";
import { CircleX } from "lucide-react";
import { useEffect, useState } from "react";

const DiscountModal = ({
  discountModalOpen,
  setDiscountModalOpen,
  activeDetail,
  updateScannedAndSession,
  showToast,
}) => {
  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [directPriceInput, setDirectPriceInput] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(
    activeDetail?.price || 0
  );
  const originalPrice = activeDetail?.price || 0;
  const curruntActiveCustomer = JSON.parse(sessionStorage.getItem('curruntActiveCustomer'));

  useEffect(() => {
    if (directPriceInput !== "") {
      const directPrice = Number(directPriceInput);
      const diff = originalPrice - directPrice;
      if (diff >= 0) {
        setDiscountValue(diff);
        setCalculatedPrice(directPrice.toFixed(2));
      } else {
        setCalculatedPrice(originalPrice);
        setDiscountValue(0);
      }
    } else {
      const discount = Number(discountValue);
      let finalPrice = originalPrice;

      if (discountType === "flat") {
        finalPrice = originalPrice - discount;
      } else if (discountType === "percentage") {
        finalPrice = originalPrice - (originalPrice * discount) / 100;
      }

      setCalculatedPrice(finalPrice > 0 ? finalPrice.toFixed(2) : 0);
    }
  }, [discountValue, discountType, originalPrice, directPriceInput]);

  const handleSaveOnly = () => {
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

  const handleApplyDiscount = async () => {
    const Device_Token = sessionStorage.getItem("device_token");
    const discount = Number(discountValue);
    const hasDiscount = discount > 0;

    const body = {
      Mode: "AddToCart",
      Token: Device_Token,
      ReqData: JSON.stringify([
        {
          ForEvt: "AddToCart",
          DeviceToken: Device_Token,
          AppId: 3,
          JobNo: activeDetail?.JobNo,
          CustomerId: curruntActiveCustomer?.CustomerId,
          IsVisitor: curruntActiveCustomer?.IsVisitor,
          DiscountOnId: hasDiscount
            ? directPriceInput !== ""
              ? 1
              : discountType === "flat"
              ? 1
              : 0
            : 0,
          Discount: hasDiscount ? discount : 0,
        },
      ]),
    };
    try {
      await CallApi(body);

      showToast({
        message: hasDiscount
          ? "Item added to cart with discount"
          : "Item added to cart",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 5000,
      });

      const updated = {
        ...activeDetail,
        isInCartList: 1,
        discountedPrice: hasDiscount ? calculatedPrice : originalPrice,
      };
      updateScannedAndSession(updated);
      setDiscountModalOpen(false);
    } catch (error) {
      console.error("Error applying discount", error);
      showToast({
        message: "Failed to add to cart",
        bgColor: "#f44336",
        fontColor: "#fff",
        duration: 5000,
      });
    }
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
          type="number"
          fullWidth
          value={directPriceInput}
          onChange={(e) => {
            const val = e.target.value;
            setDirectPriceInput(val);
            if (val === "") {
              setDiscountValue("");
            }
          }}
          sx={{ my: 2 }}
        />

        <ToggleButtonGroup
          value={discountType}
          exclusive
          onChange={(e, newVal) => {
            if (newVal && directPriceInput === "") {
              setDiscountType(newVal);
            }
          }}
          fullWidth
          disabled={directPriceInput !== ""}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="flat">Flat Amount</ToggleButton>
          <ToggleButton value="percentage">Percentage</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label={discountType === "flat" ? "Discount (₹)" : "Discount (%)"}
          type="number"
          fullWidth
          disabled={directPriceInput !== ""}
          value={discountValue === 0 ? "" : discountValue}
          onChange={(e) => {
            const val = e.target.value;
            setDiscountValue(val === "" ? 0 : Number(val));
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
          {/* <Button
            variant="outlined"
            color="error"
            onClick={() => setDiscountModalOpen(false)}
          >
            Cancel
          </Button> */}
          <Button
            style={{
              backgroundColor: "rgb(149 51 250)",
              color: "white",
            }}
            onClick={handleSaveOnly}
          >
            Save
          </Button>
          <Button
            onClick={handleApplyDiscount}
            style={{
              backgroundColor: "#5e08b6",
              color: "white",
            }}
          >
            Add to Cart
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default DiscountModal;
