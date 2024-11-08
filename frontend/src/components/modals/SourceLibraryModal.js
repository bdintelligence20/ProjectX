import React, { useEffect, useState } from 'react';
import { Box, Typography, Modal, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
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

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
          Source Library
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box>
            {/* Display Files */}
            {Object.keys(sources.files).map((category) => (
              <Box key={category}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginTop: '20px' }}>
                  {category.replace(/_/g, ' ')}
                </Typography>
                <List>
                  {sources.files[category].map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={file.name} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
            
            {/* Display URLs */}
            {Object.keys(sources.urls).map((category) => (
              <Box key={category}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginTop: '20px' }}>
                  {category.replace(/_/g, ' ')}
                </Typography>
                <List>
                  {sources.urls[category].map((url, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={url.name} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Modal>
  );
}
