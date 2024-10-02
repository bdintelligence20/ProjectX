import React from 'react';
import { Box, Typography, Modal } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '900px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '16px',
  padding: '40px',
  outline: 'none',
};

// This is the reusable modal component
export default function CustomModal({ open, handleClose, title, children }) {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>{title}</Typography>
        <Box>
          {children} {/* This allows dynamic content */}
        </Box>
      </Box>
    </Modal>
  );
}
