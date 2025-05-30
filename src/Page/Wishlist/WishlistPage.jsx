import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Box,
  Stack,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Printer, ScrollText } from "lucide-react";
import "./WishlistPage.scss";
import ConfirmationDialog from "../../Utils/ConfirmationDialog/ConfirmationDialog";
import { GetCartWishApi } from "../../API/Cart_WishlistAPI/GetCartlistApi";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import { RemoveFromCartWishApi } from "../../API/Cart_WishlistAPI/RemoveFromCartWishApi";
import NoDataFound from "../../Utils/NoDataFound";
import { AddCartFromWishListApi } from "../../API/Cart_WishlistAPI/AddCartFromWishListApi";
import { showToast } from "../../Utils/Tostify/ToastManager";

const WishlistCard = lazy(() =>
  import("../../components/WishlistComp/WishCard")
);

const WishlistPage = () => {
  const [isLoading, setIsLoading] = useState(null);
  const [WishlistItems, setWishlistItems] = useState([]);
  const [opencnfDialogOpen, setOpenCnfDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  console.log('selectedItems: ', selectedItems);
  const [rmflag, setRmFlag] = useState("");

  const getWishlistData = async () => {
    setIsLoading(true);
    const res = await GetCartWishApi({ mode: "GetWishList" });
    if (res) {
      const updated = res?.DT?.map(item => ({ ...item, isSelected: false }));
      setWishlistItems(updated);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getWishlistData();
  }, []);

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    const updatedItems = WishlistItems.map((item) => ({
      ...item,
      isSelected: checked,
    }));
    setWishlistItems(updatedItems);
    setSelectedItems(checked ? updatedItems : []);
  };

  const handleSelectItem = (item) => {
    const updatedItems = WishlistItems.map((wishlistItem) =>
      wishlistItem.CartWishId === item.CartWishId
        ? { ...wishlistItem, isSelected: !wishlistItem.isSelected }
        : wishlistItem
    );
    setWishlistItems(updatedItems);

    const updatedSelectedItems = updatedItems.filter(i => i.isSelected);
    setSelectedItems(updatedSelectedItems);
  };

  const hanldeRemoveFromCart = async () => {
    let allScanJobData = JSON?.parse(sessionStorage.getItem("AllScanJobData")) || [];
    const res = await RemoveFromCartWishApi({ mode: "RemoveFromWishList", flag: rmflag, cartWishData: selectedItems[0] });
    if (res) {
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item)));
      setSelectedItems([]);
      allScanJobData = allScanJobData?.map(item =>
        item.JobNo === selectedItems[0].JobNo ? { ...item, isInWishList: 0 } : item
      );
      sessionStorage.setItem("AllScanJobData", JSON.stringify(allScanJobData));
      showToast({
        message: "Item removed from wishlist",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 3000,
      });
    }
    handleCloseDialog();
  };

  const handleRemoveFromCartAll = async () => {
    let allScanJobData = JSON?.parse(sessionStorage.getItem("AllScanJobData")) || [];
    setIsLoading(true);
    const res = await RemoveFromCartWishApi({ mode: "RemoveFromWishList", flag: rmflag, cartWishData: WishlistItems[0], IsRemoveAll: 1 });
    if (res) {
      setWishlistItems([]);
      setSelectedItems([]);
      allScanJobData = allScanJobData?.map(item =>
        WishlistItems?.some(wishlistItem => wishlistItem.JobNo === item.JobNo) ? { ...item, isInWishList: 0 } : item
      );
      sessionStorage?.setItem("AllScanJobData", JSON?.stringify(allScanJobData));
      showToast({
        message: "Items removed from wishlist",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 3000,
      });
    }
    setIsLoading(false);
    handleCloseDialog();
  };

  const handleWishToCart = async (wishlistItem) => {
    const res = await AddCartFromWishListApi({ flag: "single", cartWishData: wishlistItem });
    if (res) {
      showToast({
        message: "Moved to cart",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 3000,
      });
      setSelectedItems(prev => prev.filter(item => item.id !== wishlistItem.id));
    }
    handleCloseDialog();
  };

  const handleAllWishToCart = async () => {
    setIsLoading(true);
    const res = await AddCartFromWishListApi({ flag: "multi", cartWishData: WishlistItems[0], IsMoveAll: 1 });
    if (res) {
      showToast({
        message: "Items moved to cart",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 3000,
      });
      setSelectedItems([]);
    }
    setIsLoading(false);
    handleCloseDialog();
  };

  const handleOpenDialog = (wishlistItem, flag) => {
    console.log('flag: ', flag);
    setRmFlag(flag);
    setSelectedItems([wishlistItem]);
    setOpenCnfDialog(true);
  };

  const handleCloseDialog = () => setOpenCnfDialog(false);
  const handleConfirmRemoveAll = () => {
    if (rmflag === "all") {
      handleRemoveFromCartAll()
    } else {
      hanldeRemoveFromCart()
    }
  };

  const allSelected = WishlistItems?.length > 0 && WishlistItems?.every(item => item.isSelected);

  return (
    <Box className="WishlistMain">
      {isLoading || isLoading == null ? (
        <LoadingBackdrop isLoading={isLoading} />
      ) : WishlistItems?.length > 0 ? (
        <>
          <Suspense fallback={<></>}>
          <Box className="WishHeaderClBtn">
              <Button variant="text" onClick={() => handleOpenDialog({}, "all")}>
                Clear All
              </Button>
            </Box>
            <Box className="WishItemList">
              {WishlistItems?.map((item) => (
                <WishlistCard
                  key={item.id}
                  wishlistItems={item}
                  isSelected={item.isSelected}
                  handleOpenDialog={handleOpenDialog}
                  handleSelectItem={() => handleSelectItem(item)}
                  handleWishToCart={handleWishToCart}
                />
              ))}
            </Box>
          </Suspense>

          <Box className="WishActionsFooter">
            {/* <Box className="wishActionBtn">
              <Box className="left-action">
                <Button variant="text" onClick={() => handleOpenDialog({}, "all")}>
                  Clear All
                </Button>
              </Box>
              <Box className="right-action">
                <FormControlLabel
                  className="checkboxBtn"
                  label="Select All"
                  labelPlacement="start"
                  control={
                    <Checkbox
                      className="WishAll-checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                  }
                />
              </Box>
            </Box> */}

            {/* <Divider className="footer-divider" /> */}

            <Stack direction="row" spacing={2} justifyContent="center" className="action-buttons">
              <Button variant="outlined" startIcon={<Printer size={18} />}>
                Print Estimate
              </Button>
              <Button variant="outlined" startIcon={<ScrollText size={18} />} onClick={handleAllWishToCart}>
                Move to Cart
              </Button>
            </Stack>
          </Box>
        </>
      ) : (
        <NoDataFound type="wishlist" />
      )}
      <ConfirmationDialog
        open={opencnfDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmRemoveAll}
        title="Confirm"
        content="Are you sure you want to remove this item?"
      />
    </Box>
  );
};

export default WishlistPage;
