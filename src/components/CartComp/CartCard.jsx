import React from 'react';
import './CartCard.scss';
import { Card, Typography, IconButton, Box } from '@mui/material';
import { Trash2 } from 'lucide-react';
import PlaceHolderImg from '../../assests/placeHolderImg.svg';

const CartCard = ({ cartItem, handleOpenDialog }) => {
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
            <Typography className="old-price">
            ₹{parseFloat(cartItem?.Amount).toFixed(2).toLocaleString()}
            </Typography>
            <Typography className="new-price">
            ₹{parseFloat(cartItem?.FinalAmount).toFixed(2).toLocaleString()}
            </Typography>
          </Box>
          <Box className="extra-price-details">
            {parseFloat(cartItem?.DiscountAmount) > 0 && (
              <Typography className="discount-amount">
                Discount:  ₹{parseFloat(cartItem?.DiscountAmount).toFixed(2).toLocaleString()}
              </Typography>
            )}
            {parseFloat(cartItem?.TotalTaxAmount) > 0 && (
              <Typography className="tax-amount">
                Tax:  ₹{parseFloat(cartItem?.TotalTaxAmount).toFixed(2).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Box className="actions">
            <IconButton onClick={() => handleOpenDialog(cartItem, 'single')}>
              <Trash2 className="btn" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CartCard;
