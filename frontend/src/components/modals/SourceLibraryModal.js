import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Paper, List, ListItem, Avatar, ListItemText, ListItemAvatar, IconButton } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  maxHeight: '80vh',
  overflow: 'auto'
};

const folderStyle = {
  padding: '20px',
  textAlign: 'center',
  borderRadius: '8px',
  backgroundColor: '#f3f4f6',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
};

export default function SourceLibraryModal({ open, onClose }) {
  const [sources, setSources] = useState({ files: {}, urls: {} });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState({
    type: null, // 'files' or 'urls'
    category: null
  });

  useEffect(() => {
    if (open) {
      const fetchSources = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/sources');
          if (response.status === 200) {
            setSources(response.data);
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

  const handleFolderClick = (type, category) => {
    setCurrentView({
      type,
      category
    });
  };

  const handleBackClick = () => {
    setCurrentView({
      type: null,
      category: null
    });
  };

  // Format the folder/category name for display
  const formatName = (name) => {
    return name.replace(/_/g, ' ');
  };

  // Get the total number of items in a category
  const getCategoryItemCount = (type, category) => {
    return sources[type][category]?.length || 0;
  };

  const renderItemList = () => {
    const items = sources[currentView.type][currentView.category] || [];
    
    return (
      <List>
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar>
                {currentView.type === 'urls' ? <LanguageIcon /> : <DescriptionIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={item.name}
              secondary={`Added: ${new Date().toLocaleDateString()}`} // You can add actual date if available
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderFolderGrid = () => {
    const allCategories = [
      ...Object.keys(sources.files).map(category => ({ type: 'files', category })),
      ...Object.keys(sources.urls).map(category => ({ type: 'urls', category }))
    ];

    return (
      <Grid container spacing={3}>
        {allCategories.map(({ type, category }) => (
          <Grid item xs={12} sm={6} md={4} key={`${type}-${category}`}>
            <Paper
              sx={folderStyle}
              elevation={3}
              onClick={() => handleFolderClick(type, category)}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <FolderIcon sx={{ fontSize: 40, color: type === 'urls' ? '#2196f3' : '#ff9800' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatName(category)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getCategoryItemCount(type, category)} {type === 'urls' ? 'URLs' : 'Files'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={modalStyle}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        {currentView.category && (
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {currentView.category ? formatName(currentView.category) : 'Source Library'}
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : currentView.category ? (
        renderItemList()
      ) : (
        renderFolderGrid()
      )}
    </Box>
  );
}