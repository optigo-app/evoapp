import React from 'react';
import './CartCard.scss';
import { Card, Typography, IconButton, Box } from '@mui/material';
import { Printer, Trash2 } from 'lucide-react';
import PlaceHolderImg from '../../assests/placeHolderImg.svg';

const CartCard = ({ cartItem, handleOpenDialog, setPrintInfo, findleSingleDataPrint, cartItems }) => {
  const handlePrint = (data) => {
    const findArray = cartItems?.filter(item => item.JobNo === data?.JobNo);
    setPrintInfo(findArray);
    findleSingleDataPrint();
  }
  return (
    <Card className="Cart-card">
      <Box className="card-content">
        <img
          src={cartItem?.CDNDesignImageFol + cartItem?.ImageName}
          alt={cartItem?.TitalLine}
          className="product-image"
          loading="lazy"
          onError={(e) => (e.target.src = PlaceHolderImg)}
        />

        <Box className="product-details">
          <Box className="product-id">
            <Typography className="itemCode">
              {cartItem?.DesignNo} ({cartItem?.JobNo})
            </Typography>
            {cartItem?.StockId && <span className="status-dot" />}
          </Box>

          <Typography variant="subtitle1" className="product-title">
            {cartItem?.TitalLine}
          </Typography>

          <Box className="price-section">
            <Typography className={cartItem?.Discount === 0 ? "old-price-withoutdiscount" : "old-price"}>
              ₹{parseFloat(cartItem?.Amount).toFixed(0).toLocaleString()}
            </Typography>
            {cartItem?.Discount !== 0 && <Typography className="newprice_save">
              Save ₹{parseFloat(cartItem?.DiscountAmount).toFixed(0).toLocaleString()}
            </Typography>}
          </Box>
          <Box className="extra-price-details">
            {parseFloat(cartItem?.DiscountAmount) > 0 && (
              <Typography className="discount-amount">
                Offered Price: ₹{parseFloat(cartItem?.TaxbleAmount).toFixed(0).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Box className="price-section">
            <Typography className="new-price">
              ₹{parseFloat(cartItem?.FinalAmount).toFixed(0).toLocaleString()}
            </Typography>
            {parseFloat(cartItem?.TotalTaxAmount) > 0 && (
              <Typography className="tax-amount">
                (Inc.Tax: ₹{parseFloat(cartItem?.TotalTaxAmount).toFixed(0).toLocaleString()})
              </Typography>
            )}
          </Box>
          <Box className="actions">
            <IconButton onClick={() => handleOpenDialog(cartItem, 'single')}>
              <Trash2 className="btn" />
            </IconButton>
            <IconButton onClick={() => handlePrint(cartItem)}>
              <Printer className="btn" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CartCard;
