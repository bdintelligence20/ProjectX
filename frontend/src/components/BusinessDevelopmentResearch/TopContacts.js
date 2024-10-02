import React from 'react';
import { Box, Typography } from '@mui/material';

export default function TopContacts() {
  return (
    <Box>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <Typography variant="body2"><strong>John Doe</strong> - CEO</Typography>
        <Typography variant="body2"><strong>Email:</strong> johndoe@mtn.com</Typography>
        <Typography variant="body2"><strong>Phone:</strong> +123-456-7890</Typography>
      </Box>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <Typography variant="body2"><strong>Jane Smith</strong> - CFO</Typography>
        <Typography variant="body2"><strong>Email:</strong> janesmith@mtn.com</Typography>
        <Typography variant="body2"><strong>Phone:</strong> +123-456-7890</Typography>
      </Box>
    </Box>
  );
}
