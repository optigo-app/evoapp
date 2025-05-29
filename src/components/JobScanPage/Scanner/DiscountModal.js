
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
    const [calculatedPrice, setCalculatedPrice] = useState(
      activeDetail?.price || 0
    );
  
    const originalPrice = activeDetail?.price || 0;
  
    useEffect(() => {
      const discount = Number(discountValue);
      let finalPrice = originalPrice;
  
      if (discountType === "flat") {
        finalPrice = originalPrice - discount;
      } else if (discountType === "percentage") {
        finalPrice = originalPrice - (originalPrice * discount) / 100;
      }
  
      setCalculatedPrice(finalPrice > 0 ? finalPrice.toFixed(2) : 0);
    }, [discountValue, discountType, originalPrice]);
  
    const handleSaveOnly = () => {
      const updated = {
        ...activeDetail,
        discountValue: Number(discountValue),
        discountType,
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
            JobNo: activeDetail?.jobNumber,
            CustomerId: activeDetail?.CustomerId,
            IsVisitor: activeDetail?.IsVisitor,
            DiscountOnId: hasDiscount
              ? discountType === "flat"
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
            width: 360,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          {/* Top Buttons */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mb={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDiscountModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="contained" color="info" onClick={handleSaveOnly}>
              Save
            </Button>
            <Button variant="contained" color="success" onClick={handleApplyDiscount}>
              Add to Cart
            </Button>
          </Stack>
  
          <Divider sx={{ mb: 2 }} />
  
          {/* Details */}
          <Typography variant="h6" gutterBottom>
            Apply Discount
          </Typography>
          <Typography variant="body2">
            <strong>Job No:</strong> {activeDetail?.jobNumber}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Original Price:</strong> ₹{originalPrice}
          </Typography>
  
          {/* Discount type toggle */}
          <ToggleButtonGroup
            value={discountType}
            exclusive
            onChange={(e, newVal) => newVal && setDiscountType(newVal)}
            fullWidth
            sx={{ my: 2 }}
          >
            <ToggleButton value="flat">Flat Amount</ToggleButton>
            <ToggleButton value="percentage">Percentage</ToggleButton>
          </ToggleButtonGroup>
  
          {/* Discount input */}
          <TextField
            label={discountType === "flat" ? "Discount (₹)" : "Discount (%)"}
            type="number"
            fullWidth
            value={discountValue === 0 ? "" : discountValue}
            onChange={(e) => {
              const val = e.target.value;
              setDiscountValue(val === "" ? 0 : Number(val));
            }}
            sx={{ mb: 2 }}
          />
  
          {/* Total after discount */}
          <TextField
            label="Total After Discount"
            value={`₹${calculatedPrice}`}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Box>
      </Modal>
    );
  };
  
  export default DiscountModal;
  