import React from 'react';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Paper,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '900px',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '16px',
  outline: 'none',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

export default function CustomModal({ open, handleClose, title, children }) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper sx={modalStyle}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            id="modal-title"
            variant="h5"
            component="h2"
            fontWeight="bold"
          >
            {title}
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            p: 3,
            overflowY: 'auto',
            flexGrow: 1,
          }}
        >
          {children}
        </Box>
      </Paper>
    </Modal>
  );
}