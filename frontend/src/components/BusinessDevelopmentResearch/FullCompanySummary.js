import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export default function FullCompanySummary() {
  return (
    <Box>
      <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '30px' }}>
        Below you will find a comprehensive summary of the requested company, MTN.
      </Typography>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
          Do androids dream of electric sheep or not? Explained in ELI5
        </Typography>
        <Box display="flex" justifyContent="space-between" marginBottom="20px">
          <Link href="https://www.philipkdick.com" underline="hover">Do androids dream of electric sheep?</Link>
          <Link href="https://www.dailylm.com" underline="hover">Androids explained: Why LLMs will rule the world</Link>
          <Link href="#" underline="hover">View 87+ more external sources</Link>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>Answer</Typography>
        <Typography variant="body2" sx={{ marginBottom: '20px' }}>
          <strong>Current State of AI:</strong> Lack of Subjective Experience: Presently, AI lacks the capacity for subjective experience.
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: '20px' }}>
          Mimicking Human Behavior: Some AI systems are designed to mimic human behavior, but this doesn't equate to actual dreaming.
        </Typography>
      </Box>
    </Box>
  );
}
