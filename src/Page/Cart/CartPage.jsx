import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Box, Stack, Button, Divider } from '@mui/material';
import { Printer, ScrollText } from 'lucide-react';
import './CartPage.scss';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';
import { GetCartWishApi } from '../../API/Cart_WishlistAPI/GetCartlistApi';
import { RemoveFromCartWishApi } from '../../API/Cart_WishlistAPI/RemoveFromCartWishApi';
import LoadingBackdrop from '../../Utils/LoadingBackdrop';
import NoDataFound from '../../Utils/NoDataFound';

const CartItemCard = lazy(() => import('../../components/CartComp/CartCard'));

const CartPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState();
  const [opencnfDialogOpen, setOpenCnfDialog] = React.useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleOpenDialog = (cartItems) => {
    setSelectedItems([cartItems]);
    setOpenCnfDialog(true);
  }
  const handleCloseDialog = () => {
    setOpenCnfDialog(false);
  }

  const hanldeRemoveFromCart = async () => {
    setIsLoading(true);
    const res = await RemoveFromCartWishApi({ mode: "RemoveFromCart", cartWishData: selectedItems[0] });
    if (res) {
      setCartItems(prevItems => prevItems.filter(item => !selectedItems.includes(item)));
      setSelectedItems([]);
    } else {
      console.error("Failed to remove items from cart");
    }
    setIsLoading(false);
    handleCloseDialog();
  }

  const handleConfirmRemoveAll = () => {
    hanldeRemoveFromCart();
  }

  const getCartData = async () => {
    setIsLoading(true);
    const mode = "GetCartList";
    const res = await GetCartWishApi({ mode });
    if (res) {
      setCartItems(res?.DT);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getCartData();
  }, [])


  const handlePrint = () => {
    // Implement print functionality here
    console.log("Print Estimate clicked");
  }

  return (
    <Box className="CartMain">
      {isLoading || isLoading == null ? (
        <LoadingBackdrop isLoading={isLoading} />
      ) : cartItems?.length > 0 ? (
        <>
          <Suspense fallback={<></>}>
            <Box className="CartItemList">
              {cartItems?.map(item => (
                <CartItemCard
                  key={item.id}
                  cartItem={item}
                  handleOpenDialog={handleOpenDialog}
                />
              ))}
            </Box>
          </Suspense>
          <Box className="CartActionsFooter">
            <Stack direction="row" spacing={2} justifyContent="center" className="action-buttons">
              <Button variant="outlined" startIcon={<ScrollText size={18} />}>
                Move to Billing
              </Button>
              <Button variant="outlined" startIcon={<Printer size={18} />} onClick={handlePrint}>
                Print Estimate
              </Button>
            </Stack>

            {/* <Divider className="footer-divider" />

            <Stack direction="row" spacing={2} justifyContent="center" className="text-buttons">
              <Button variant="text">Go to Customer</Button>
              <Button variant="text">Remark</Button>
            </Stack> */}
          </Box>
        </>
      ) : (
        <NoDataFound type="cart" />
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

export default CartPage;
