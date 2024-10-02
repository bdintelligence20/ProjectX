import React from 'react';
import { Box, Link } from '@mui/material';

export default function AnnualReports() {
  return (
    <Box>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <Link href="#">Download 2024 Annual Report (PDF)</Link>
      </Box>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <Link href="#">Download 2023 Annual Report (PDF)</Link>
      </Box>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <Link href="#">Download 2022 Annual Report (PDF)</Link>
      </Box>
    </Box>
  );
}
