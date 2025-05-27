import React from 'react';
import { Box, Typography, Stack, IconButton, Button, Divider } from '@mui/material';
import {ChevronLeft, Printer, ScrollText } from 'lucide-react';
import CartItemCard from '../../components/CardCompoennt/CartCard';
import './CartPage.scss';
import cartItems from "../../Utils/cartData.json"

const CartPage = () => {
  return (
    <Box className="CartMain">
      {/* Header */}
      <Box className="CartHeader_main">
        <Stack direction="row" justifyContent="space-between" alignItems="center" className="header-container">
          <IconButton>
            <ChevronLeft className="back-arrow" />
          </IconButton>
          <Typography variant="body" fontWeight={600} className='header_title'>
            Cart Items
          </Typography>
          <Box textAlign="right" className="header_subtitle">
            <Typography variant="body2" fontWeight={600}>John Smith</Typography>
            <Typography variant="caption">#C12345</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Cart Items List */}
      <Box className="CartItemList">
        {cartItems.map(item => (
          <CartItemCard key={item.id} cartItem={item} />
        ))}
      </Box>
      {/* Bottom Fixed Buttons */}
      <Box className="CartActionsFooter">
        <Stack direction="row" spacing={2} justifyContent="center" className="action-buttons">
          <Button variant="outlined" startIcon={<ScrollText  size={18} />}>
            Move to Billing
          </Button>
          <Button variant="outlined" startIcon={<Printer size={18} />}>
            Print
          </Button>
        </Stack>

        <Divider className="footer-divider" />

        <Stack direction="row" spacing={2} justifyContent="center" className="text-buttons">
          <Button variant="text">Go to Customer</Button>
          <Button variant="text">Remark</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CartPage;
