import React from 'react';
import './CartItemCard.scss';
import { Card, Typography, IconButton, Checkbox, Box } from '@mui/material';
import { ShoppingCart, Trash2 } from 'lucide-react';

const ProductCard = ({ cartItem }) => {
  const {
    id,
    itemCode,
    title,
    image,
    oldPrice,
    newPrice,
    inStock = true,
    selected = false,
  } = cartItem;

  return (
    <Card className="product-card">
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
              <ShoppingCart  className='btn'/>
            </IconButton>
            <IconButton>
              <Trash2  className='btn'/>
            </IconButton>
          </Box>
        </Box>
        <Checkbox className="product-checkbox" checked={selected} />
      </Box>
    </Card>
  );
};

export default ProductCard;
