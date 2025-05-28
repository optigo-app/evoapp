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
import cartItems from "../../Utils/cartData.json";
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
  const [WishlistItems, setWishlistItems] = useState();
  console.log("WishlistItems: ", WishlistItems);
  const [opencnfDialogOpen, setOpenCnfDialog] = React.useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  console.log('selectedItems: ', selectedItems);

  const getWishlistData = async () => {
    setIsLoading(true);
    const mode = "GetWishList";
    const res = await GetCartWishApi({ mode });
    if (res) {
      setWishlistItems(res?.DT);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getWishlistData();
  }, []);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedItems(cartItems);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(item)
        ? prevSelectedItems.filter((selectedItem) => selectedItem !== item)
        : [...prevSelectedItems, item]
    );
  };
  const hanldeRemoveFromCart = async () => {
    setIsLoading(true);
    const res = await RemoveFromCartWishApi({ mode: "RemoveFromWishList", cartWishData: selectedItems[0] });
    if (res) {
      setWishlistItems(prevItems => prevItems.filter(item => !selectedItems.includes(item)));
      setSelectedItems([]);
    } else {
      console.error("Failed to remove items from cart");
    }
    setIsLoading(false);
    handleCloseDialog();
  }

  const handleWishToCart = async (wishlistItems) => {
    setIsLoading(true);
    const res = await AddCartFromWishListApi({ flag: "single", cartWishData: wishlistItems });
    if (res) {
      console.log("wishlist to cart added successfully");
      setSelectedItems([]);
    } else {
      console.error("Failed to remove items from cart");
    }
    setIsLoading(false);
    handleCloseDialog();
  };

  const handleAllWishToCart = async () => {
    setIsLoading(true);
    const res = await AddCartFromWishListApi({ flag: "multi", cartWishData: WishlistItems[0], IsMoveAll: 1 });
    if (res) {
      console.log("wishlist to cart added successfully");
      setSelectedItems([]);
    } else {
      console.error("Failed to remove items from cart");
    }
    setIsLoading(false);
    handleCloseDialog();
  };

  const handleOpenDialog = (wishlistItems) => {
    setSelectedItems([wishlistItems]);
    setOpenCnfDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenCnfDialog(false);
  };

  const handleConfirmRemoveAll = () => {
    hanldeRemoveFromCart();
  }

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
                  handleOpenDialog={handleOpenDialog}
                  isSelected={selectedItems.includes(item)}
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
                    onChange={handleSelectAll}
                  />
                }
              />
            </Box>
            <Divider className="footer-divider" />

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              className="action-buttons"
            >
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
