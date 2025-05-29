import React from 'react';
import './CartCard.scss';
import { Card, Typography, IconButton, Box } from '@mui/material';
import { Trash2 } from 'lucide-react';

const CartCard = ({ cartItem, handleOpenDialog }) => {
  const price = "34343.5050"

  return (
    <Card className="Cart-card">
      <Box className="card-content">
        <img src={cartItem?.CDNDesignImageFol + cartItem?.ImageName} alt={cartItem?.TitalLine} className="product-image" />
        <Box className="product-details">
          <Box className="product-id">
            <Typography className='itemCode'>{cartItem?.JobNo}({cartItem?.DesignNo})</Typography>
            {cartItem?.StockId && <span className="status-dot" />}
          </Box>
          <Typography variant="subtitle1" className="product-title">
            {cartItem?.TitalLine}
          </Typography>
          <Box className="price-section">
            <Typography className="old-price">₹{parseFloat(price).toFixed(2)?.toLocaleString()}</Typography>
            <Typography className="new-price">₹{parseFloat(cartItem?.Amount).toFixed(2)?.toLocaleString()}</Typography>
          </Box>
          <Box className="actions">
            <IconButton onClick={() => handleOpenDialog(cartItem)}>
              <Trash2 className='btn' />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CartCard;
