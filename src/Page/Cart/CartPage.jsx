import React from 'react';
import { Box, Typography, Button, Stack, IconButton, Divider } from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import './CartPage.scss';

const dummyCartItems = [
  {
    image: 'https://blingbag.co.in/cdn/shop/files/IvorySarthiBridalJewellerySet_1.jpg?v=1730983702',
    code: 'JB2023-456',
    title: 'Bangle',
    tray: 'Tray 3',
    originalPrice: '45,000',
    discountedPrice: '42,750',
  },
  {
    image: 'https://media.istockphoto.com/id/1427466115/photo/beauty-model-in-wedding-jewelry-set-elegant-woman-in-necklace-with-earring-and-ring-beautiful.jpg?s=612x612&w=0&k=20&c=AT9DfkZvRbxKkuqjCEGjF9P3D3dOKZvRh2J5hw8mjt0=',
    code: 'JB2023-456',
    title: 'Bangle',
    tray: 'Tray 3',
    originalPrice: '45,000',
    discountedPrice: '42,750',
  },
  {
    image: 'https://www.shutterstock.com/image-photo/beautiful-girl-set-jewelry-woman-600nw-1482513683.jpg',
    code: 'JB2023-456',
    title: 'Bangle',
    tray: 'Tray 3',
    originalPrice: '45,000',
    discountedPrice: '42,750',
  },
];

const CartPage = () => {
  return (
    <Box className="CartMain">
      {/* Header */}
      <Box className='CartHeader_main'>
        <Stack className='header-container'>
          <IconButton>
            <ChevronLeft className='back-arrow'/>
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Cart Items
          </Typography>
          <Box textAlign="right">
            <Typography variant="body2" fontWeight={600}>John Smith</Typography>
            <Typography variant="caption">#C12345</Typography>
          </Box>
        </Stack>
      </Box>

    </Box>
  );
};

export default CartPage;
