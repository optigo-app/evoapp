import React from 'react';
import './WishCard.scss';
import { Card, Typography, IconButton, Checkbox, Box } from '@mui/material';
import { ShoppingCart, Trash2 } from 'lucide-react';

const WishlistCard = ({ cartItem, handleOpenDialog, isSelected, handleSelectItem }) => {
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
    <Card className="Wishlist-card">
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
            <IconButton>
              <ShoppingCart className='btn' />
            </IconButton>
            <IconButton onClick={handleOpenDialog}>
              <Trash2 className='btn' />
            </IconButton>
          </Box>
        </Box>
        <Checkbox className="product-checkbox"
          checked={isSelected}
          onChange={handleSelectItem}
        />
      </Box>
    </Card>
  );
};

export default WishlistCard;
