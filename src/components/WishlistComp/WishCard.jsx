import React from 'react';
import './WishCard.scss';
import { Card, Typography, IconButton, Box } from '@mui/material';
import { Printer, ShoppingCart, Trash2 } from 'lucide-react';
import PlaceHolderImg from '../../assests/placeHolderImg.svg';

const WishlistCard = ({
  wishlistItems,
  isSelected,
  handleOpenDialog,
  handleSelectItem,
  handleWishToCart,
  handlePrint
}) => {
  return (
    <Card className="Wishlist-card">
      <Box className="card-content">
        <img
          src={wishlistItems?.CDNDesignImageFol + wishlistItems?.ImageName}
          alt={wishlistItems?.TitalLine}
          className="product-image"
          loading="lazy"
          onError={(e) => (e.target.src = PlaceHolderImg)}
        />
        <Box className="product-details">
          <Box className="product-id">
            <Typography className="itemCode">
              {wishlistItems?.DesignNo} ({wishlistItems?.JobNo})
            </Typography>
            {wishlistItems?.StockId && <span className="status-dot" />}
          </Box>

          <Typography variant="subtitle1" className="product-title">
            {wishlistItems?.TitalLine}
          </Typography>

          {/* {wishlistItems?.Discount !== 0 && */}
          <Box className="price-section">
            <Typography className={wishlistItems?.Discount === 0 ? "old-price-withoutdiscount" : "old-price" }>
              ₹{parseFloat(wishlistItems?.Amount).toFixed(0).toLocaleString()}
            </Typography>
            {wishlistItems?.Discount !== 0 && <Typography className="newprice_save">
              Save ₹{parseFloat(wishlistItems?.Discount).toFixed(0).toLocaleString()}
            </Typography>}
          </Box>
          {/* } */}
          <Box className="extra-price-details">
            {parseFloat(wishlistItems?.DiscountAmount) > 0 && (
              <Typography className="discount-amount">
                Offered Price: ₹{parseFloat(wishlistItems?.TaxbleAmount).toFixed(0).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Box className="price-section">
            <Typography className="new-price">
              ₹{parseFloat(wishlistItems?.FinalAmount).toFixed(0).toLocaleString()}
            </Typography>
            {parseFloat(wishlistItems?.TotalTaxAmount) > 0 && (
              <Typography className="tax-amount">
                (Inc.Tax: ₹{parseFloat(wishlistItems?.TotalTaxAmount).toFixed(0).toLocaleString()})
              </Typography>
            )}
          </Box>
          <Box className="actions">
            <IconButton onClick={() => handleWishToCart(wishlistItems)}>
              <ShoppingCart
                className={`btn ${wishlistItems?.IsInCartList !== 0 ? 'btn-active' : ''}`}
              />
            </IconButton>
            <IconButton onClick={() => handleOpenDialog(wishlistItems, 'single')}>
              <Trash2 className="btn" />
            </IconButton>
            {/* <IconButton onClick={handlePrint}>
              <Printer className="btn" />
            </IconButton> */}
          </Box>
        </Box>
        {/* <Checkbox
          className="product-checkbox"
          checked={isSelected}
          onChange={() => handleSelectItem(wishlistItems)}
        /> */}
      </Box>
    </Card>
  );
};

export default WishlistCard;
