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

const WishlistCard = lazy(() =>
  import("../../components/WishlistComp/WishCard")
);

const WishlistPage = () => {
  const [isLoading, setIsLoading] = useState(null);
  const [WishlistItems, setWishlistItems] = useState([]);
  const [opencnfDialogOpen, setOpenCnfDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

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
      wishlistItem.id === item.id
        ? { ...wishlistItem, isSelected: !wishlistItem.isSelected }
        : wishlistItem
    );
    setWishlistItems(updatedItems);

    const updatedSelectedItems = updatedItems.filter(i => i.isSelected);
    setSelectedItems(updatedSelectedItems);
  };

  const hanldeRemoveFromCart = async () => {
    setIsLoading(true);
    const res = await RemoveFromCartWishApi({ mode: "RemoveFromWishList", cartWishData: selectedItems[0] });
    if (res) {
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item)));
      setSelectedItems([]);
    }
    setIsLoading(false);
    handleCloseDialog();
  };

  const handleWishToCart = async (wishlistItem) => {
    setIsLoading(true);
    const res = await AddCartFromWishListApi({ flag: "single", cartWishData: wishlistItem });
    if (res) {
      console.log("Moved to cart");
      setSelectedItems(prev => prev.filter(item => item.id !== wishlistItem.id));
    }
    setIsLoading(false);
    handleCloseDialog();
  };

  const handleAllWishToCart = async () => {
    setIsLoading(true);
    const res = await AddCartFromWishListApi({ flag: "multi", cartWishData: WishlistItems[0], IsMoveAll: 1 });
    if (res) {
      console.log("All wishlist items moved to cart");
      setSelectedItems([]);
    }
    setIsLoading(false);
    handleCloseDialog();
  };

  const handleOpenDialog = (wishlistItem) => {
    setSelectedItems([wishlistItem]);
    setOpenCnfDialog(true);
  };

  const handleCloseDialog = () => setOpenCnfDialog(false);
  const handleConfirmRemoveAll = () => hanldeRemoveFromCart();

  const allSelected = WishlistItems.length > 0 && WishlistItems.every(item => item.isSelected);

  return (
    <Box className="WishlistMain">
      {isLoading || isLoading == null ? (
        <LoadingBackdrop isLoading={isLoading} />
      ) : WishlistItems?.length > 0 ? (
        <>
          <Suspense fallback={<></>}>
            <Box className="WishItemList">
              {WishlistItems?.map((item) => (
                <WishlistCard
                  key={item.id}
                  cartItem={item}
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
            <Box display="flex" justifyContent="flex-start">
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
            <Divider className="footer-divider" />

            <Stack direction="row" spacing={2} justifyContent="center" className="action-buttons">
              <Button variant="outlined" startIcon={<ScrollText size={18} />} onClick={handleAllWishToCart}>
                Move to Cart
              </Button>
              <Button variant="outlined" startIcon={<Printer size={18} />}>
                Print Estimate
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
