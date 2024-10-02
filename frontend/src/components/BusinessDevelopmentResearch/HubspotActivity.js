import React from 'react';
import { Box, Typography } from '@mui/material';

export default function HubspotActivity() {
  return (
    <Box>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <Typography variant="body2">Activity: Meeting scheduled with John Doe on Sept 21, 2024</Typography>
      </Box>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <Typography variant="body2">Activity: Call with Jane Smith on Sept 15, 2024</Typography>
      </Box>
    </Box>
  );
}
