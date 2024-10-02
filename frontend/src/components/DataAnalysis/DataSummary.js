import React from 'react';
import { Box, Typography } from '@mui/material';

export default function DataSummary() {
  return (
    <Box padding="20px">
      <Typography variant="h5" gutterBottom>
        Data Summary
      </Typography>
      <Typography variant="body1">
        This is a placeholder for the data summary. You can display statistics, charts, and insights from the data sources here.
      </Typography>
    </Box>
  );
}
