import React, { useEffect, useState } from 'react';
import { Box, Typography, Modal, CircularProgress, Grid, Paper, List, ListItem, Avatar, ListItemText, ListItemAvatar, IconButton } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  const [currentFolder, setCurrentFolder] = useState(null);

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
    return sources.files[category]?.reduce((acc, file) => acc + (file.size || 0), 0);
  };

  const getFormattedSize = (size) => {
    if (!size) return '0 MB';
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFolderClick = (category) => {
    setCurrentFolder(category);
  };

  const handleBackClick = () => {
    setCurrentFolder(null);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
          {currentFolder ? (
            <IconButton onClick={handleBackClick} sx={{ marginRight: '10px' }}>
              <ArrowBackIcon />
            </IconButton>
          ) : null}
          Source Library
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box>
            {currentFolder ? (
              // File List View
              <List>
                {sources.files[currentFolder].map((file, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <FolderIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={file.name}
                      secondary={`Uploaded by: ${file.uploadedBy || 'Unknown'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              // Folder Grid View
              <Grid container spacing={3}>
                {Object.keys(sources.files).map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Paper
                      sx={folderStyle}
                      elevation={3}
                      onClick={() => handleFolderClick(category)}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {category.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="body2">
                        {sources.files[category].length} Files • {getFormattedSize(calculateFolderSize(category))}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
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
        )}
      </Box>
    </Modal>
  );
}