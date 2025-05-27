import React, { lazy, Suspense, useState } from 'react';
import { Box, Stack, Button, Divider, Checkbox, FormControlLabel } from '@mui/material';
import { Printer, ScrollText } from 'lucide-react';
import './WishlistPage.scss';
import cartItems from "../../Utils/cartData.json"
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';

const WishlistCard = lazy(() => import('../../components/WishlistComp/WishCard'));

const WishlistPage = () => {
  const [opencnfDialogOpen, setOpenCnfDialog] = React.useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedItems(cartItems);
    } else {
      setSelectedItems([]);
    }
  }

  const handleSelectItem = (item) => {
    setSelectedItems(prevSelectedItems =>
      prevSelectedItems.includes(item)
        ? prevSelectedItems.filter(selectedItem => selectedItem !== item)
        : [...prevSelectedItems, item]
    );
  }

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

  return (
    <Box className="WishlistMain">
      {/* Cart Items List */}
      <Suspense fallback={<></>}>
        <Box className="WishItemList">
          {cartItems?.map(item => (
            <WishlistCard
              key={item.id}
              cartItem={item}
              handleOpenDialog={handleOpenDialog}
              isSelected={selectedItems.includes(item)}
              handleSelectItem={() => handleSelectItem(item)}
            />
          ))}
        </Box>
      </Suspense>
      {/* Bottom Fixed Buttons */}
      <Box className="WishActionsFooter">
        <Box display="flex" justifyContent="flex-start">
          <FormControlLabel
            className='checkboxBtn'
            label="Select All"
            labelPlacement="start"
            control={<Checkbox className="WishAll-checkbox" onChange={handleSelectAll} />}
          />
        </Box>
        <Divider className="footer-divider" />

        <Stack direction="row" spacing={2} justifyContent="center" className="action-buttons">
          <Button variant="outlined" startIcon={<ScrollText size={18} />}>
            Move to Cart
          </Button>
          <Button variant="outlined" startIcon={<Printer size={18} />}>
            Print Estimate
          </Button>
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

export default WishlistPage;
