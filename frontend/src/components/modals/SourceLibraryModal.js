import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  Avatar,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Stack,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Language as LanguageIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';

export default function SourceLibraryModal({ onClose }) {
  const [sources, setSources] = useState({ files: {}, urls: {} });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState({
    type: null,
    category: null
  });

  useEffect(() => {
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
  }, []);

  const formatName = (name) => name.replace(/_/g, ' ');
  
  const getCategoryItemCount = (type, category) => sources[type][category]?.length || 0;

  const renderItemList = () => {
    const items = sources[currentView.type][currentView.category] || [];
    
    return (
      <Paper elevation={0} sx={{ p: 2 }}>
        <List>
          {items.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                mb: 1,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: currentView.type === 'urls' ? 'primary.main' : 'warning.main' }}>
                  {currentView.type === 'urls' ? <LanguageIcon /> : <DescriptionIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={`Added: ${new Date().toLocaleDateString()}`}
                primaryTypographyProps={{
                  fontWeight: 'medium',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  const renderFolderGrid = () => {
    const allCategories = [
      ...Object.keys(sources.files).map(category => ({ type: 'files', category })),
      ...Object.keys(sources.urls).map(category => ({ type: 'urls', category }))
    ];

    return (
      <Grid2 container spacing={3}>
        {allCategories.map(({ type, category }) => (
          <Grid2 xs={12} sm={6} md={4} key={`${type}-${category}`}>
            <Paper
              elevation={0}
              onClick={() => setCurrentView({ type, category })}
              sx={{
                p: 3,
                height: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[4],
                  borderColor: 'primary.main',
                },
              }}
            >
              <Stack spacing={2} alignItems="center">
                <FolderIcon 
                  sx={{ 
                    fontSize: 40,
                    color: type === 'urls' ? 'primary.main' : 'warning.main',
                  }}
                />
                <Typography variant="h6" fontWeight="bold">
                  {formatName(category)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getCategoryItemCount(type, category)} {type === 'urls' ? 'URLs' : 'Files'}
                </Typography>
              </Stack>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    );
  };

  return (
    <Box sx={{ maxHeight: '80vh', overflow: 'auto' }}>
      {/* Header */}
      <Box 
        sx={{ 
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          pb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {currentView.category && (
            <IconButton 
              onClick={() => setCurrentView({ type: null, category: null })}
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h5" fontWeight="bold">
            {currentView.category ? formatName(currentView.category) : 'Source Library'}
          </Typography>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ mt: 2 }}>
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
    </Box>
  );
}