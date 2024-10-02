import React from 'react';
import { Box, Typography } from '@mui/material';

export default function ViewData() {
  return (
    <Box padding="20px">
      <Typography variant="h5" gutterBottom>
        View Data
      </Typography>
      <Typography variant="body1">
        This is a placeholder for viewing the raw data. You can provide a detailed view or table of the data here.
      </Typography>
    </Box>
  );
}
