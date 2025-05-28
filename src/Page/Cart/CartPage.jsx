import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Box, Stack, Button, Divider } from '@mui/material';
import { Printer, ScrollText } from 'lucide-react';
import './CartPage.scss';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';
import { GetCartWishApi } from '../../API/Cart_WishlistAPI/GetCartlistApi';

const CartItemCard = lazy(() => import('../../components/CartComp/CartCard'));

const CartPage = () => {
  const [cartItems, setCartItems] = useState();
  const [opencnfDialogOpen, setOpenCnfDialog] = React.useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const getCartData = async () => {
    const mode = "GetCartList";
    const res = await GetCartWishApi({ mode });
    setCartItems(res?.DT);
  }

  useEffect(() => {
    getCartData();
  }, [])

  const handleOpenDialog = () => {
    setOpenCnfDialog(true);
  }
  const handleCloseDialog = () => {
    setOpenCnfDialog(false);
  }
  const handleConfirmRemoveAll = () => {
    console.log("All items removed from the cart");
    handleCloseDialog();
  }

  const handlePrint = () => {
    // Implement print functionality here
    console.log("Print Estimate clicked");
  }

  return (
    <Box className="CartMain">
      {/* Cart Items List */}
      <Suspense fallback={<></>}>
        <Box className="CartItemList">
          {cartItems?.map(item => (
            <CartItemCard
              key={item.id}
              cartItem={item}
              handleOpenDialog={handleOpenDialog}
              isSelected={selectedItems?.includes(item)}
            />
          ))}
        </Box>
      </Suspense>
      {/* Bottom Fixed Buttons */}
      <Box className="CartActionsFooter">
        <Stack direction="row" spacing={2} justifyContent="center" className="action-buttons">
          <Button variant="outlined" startIcon={<ScrollText size={18} />}>
            Move to Billing
          </Button>
          <Button variant="outlined" startIcon={<Printer size={18} />} onClick={handlePrint}>
            Print Estimate
          </Button>
        </Stack>

        <Divider className="footer-divider" />

        <Stack direction="row" spacing={2} justifyContent="center" className="text-buttons">
          <Button variant="text">Go to Customer</Button>
          <Button variant="text">Remark</Button>
        </Stack>
      </Box>
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
