import React from 'react';
import './CartCard.scss';
import { Card, Typography, IconButton, Box } from '@mui/material';
import {Trash2 } from 'lucide-react';

const CartCard = ({ cartItem, handleOpenDialog }) => {
  const {
    id,
    itemCode,
    title,
    image,
    oldPrice,
    newPrice,
    inStock = true,
  } = cartItem;

  return (
    <Card className="Cart-card">
      <Box className="card-content">
        <img src={image} alt={title} className="product-image" />
        <Box className="product-details">
          <Box className="product-id">
            <Typography className='itemCode'>{itemCode}</Typography>
            {inStock && <span className="status-dot" />}
          </Box>
          <Typography variant="subtitle1" className="product-title">
            {title}
          </Typography>
          <Box className="price-section">
            <Typography className="old-price">₹{oldPrice.toLocaleString()}</Typography>
            <Typography className="new-price">₹{newPrice.toLocaleString()}</Typography>
          </Box>
          <Box className="actions">
            <IconButton onClick={handleOpenDialog}>
              <Trash2 className='btn' />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CartCard;
