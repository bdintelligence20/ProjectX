import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function QATool() {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center" 
      height="100vh"
      padding="40px"
    >
      {/* Header Section */}
      <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '36px', marginBottom: '20px' }}>
        QA Tool
      </Typography>
      <Typography 
        variant="body1" 
        color="textSecondary" 
        sx={{ 
          marginBottom: '40px', 
          maxWidth: '800px', 
          textAlign: 'Left', 
          fontSize: '18px', 
          lineHeight: '1.5' 
        }}
      >
        Users can upload PDF, DOCX, and PowerPoint files, paste text, or input website links to the quality assurance tool, 
        which displays the original content on the left and the revised version on the right, allowing for easy comparison and review of changes.
      </Typography>

      {/* File Upload Section */}
      <Box
        sx={{
          border: '2px dashed #c4c4c4',
          borderRadius: '12px',
          padding: '60px',
          textAlign: 'center',
          marginBottom: '40px',
          backgroundColor: '#fff',
          width: '100%',
          maxWidth: '700px', // Narrow the width slightly to match design
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px', fontSize: '24px' }}>
          Upload File
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '16px', marginBottom: '20px' }}>
          Drag & Drop or <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>choose file</Typography> to upload
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '16px' }}>PDF, DOCX, PPT</Typography>
      </Box>

      {/* Buttons for Website and Copied Text */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        width="100%" 
        maxWidth="700px" // Match the width of the upload box
        gap="20px"
      >
        <Button 
          variant="outlined" 
          sx={{ 
            flex: 1, 
            padding: '15px', 
            fontSize: '16px', 
            textTransform: 'none', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            backgroundColor: '#f0f0f0',
            height: '64px' // Match button height to make it more substantial
          }}
        >
          Website
        </Button>
        <Button 
          variant="outlined" 
          sx={{ 
            flex: 1, 
            padding: '15px', 
            fontSize: '16px', 
            textTransform: 'none', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            backgroundColor: '#f0f0f0',
            height: '64px' // Match button height to make it more substantial
          }}
        >
          Copied Text
        </Button>
      </Box>
    </Box>
  );
}
