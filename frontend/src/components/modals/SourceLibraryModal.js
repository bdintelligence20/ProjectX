import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, IconButton, CircularProgress } from '@mui/material';
import axios from 'axios';

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

export default function SourceLibraryModal({ open, handleClose }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchSources();
    }
  }, [open]);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/sources');
      if (response.status === 200) {
        setSources(response.data);
      } else {
        console.error('Failed to fetch sources');
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
          Source Library
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : sources.length > 0 ? (
          sources.map((source, index) => (
            <Box
              key={index}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#fff',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                {source.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {source.source_type}
              </Typography>
              {source.content && (
                <Typography variant="body2" sx={{ marginTop: '10px', color: '#666' }}>
                  {source.content.substring(0, 100)}...
                </Typography>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No sources available.
          </Typography>
        )}
      </Box>
    </Modal>
  );
}
