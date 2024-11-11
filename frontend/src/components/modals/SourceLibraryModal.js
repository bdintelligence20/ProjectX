import React, { useEffect, useState } from 'react';
import { Box, Typography, Modal, CircularProgress, Grid, Paper } from '@mui/material';
import axios from 'axios';

axios.defaults.baseURL = 'https://projectx-53gn.onrender.com';

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

const folderStyle = {
  padding: '20px',
  textAlign: 'center',
  borderRadius: '8px',
  backgroundColor: '#f3f4f6',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
};

export default function SourceLibraryModal({ open, onClose }) {
  const [sources, setSources] = useState({ files: {}, urls: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      const fetchSources = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/sources');
          if (response.status === 200) {
            setSources(response.data);
          } else {
            console.error('Failed to fetch sources, status code:', response.status);
          }
        } catch (error) {
          console.error('Error fetching sources:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSources();
    }
  }, [open]);

  const calculateFolderSize = (category) => {
    // Placeholder function for calculating folder size, assuming file objects have a 'size' property
    // Replace with actual size calculation logic if available
    return sources.files[category]?.reduce((acc, file) => acc + (file.size || 0), 0);
  };

  const getFormattedSize = (size) => {
    if (!size) return '0 MB';
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
          Source Library
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            {/* Display Files as folders */}
            {Object.keys(sources.files).map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Paper sx={folderStyle} elevation={3}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {category.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="body2">
                    {sources.files[category].length} Files • {getFormattedSize(calculateFolderSize(category))}
                  </Typography>
                </Paper>
              </Grid>
            ))}
            
            {/* Display URLs as folders */}
            {Object.keys(sources.urls).map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Paper sx={folderStyle} elevation={3}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {category.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="body2">
                    {sources.urls[category].length} URLs
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Modal>
  );
}
