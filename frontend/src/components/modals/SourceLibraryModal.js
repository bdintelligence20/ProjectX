import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
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
  const [openFolders, setOpenFolders] = useState({});

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

  const toggleFolder = (category) => {
    setOpenFolders((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
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
          <Box>
            {/* Display Files */}
            {Object.keys(sources.files).map((category) => (
              <Box key={category}>
                <ListItemButton onClick={() => toggleFolder(category)}>
                  <ListItemText primary={category.replace(/_/g, ' ')} />
                  {openFolders[category] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openFolders[category]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {sources.files[category].map((file, index) => (
                      <ListItem key={index} sx={{ pl: 4 }}>
                        <ListItemText primary={file.name} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}

            {/* Display URLs */}
            {Object.keys(sources.urls).map((category) => (
              <Box key={category}>
                <ListItemButton onClick={() => toggleFolder(category)}>
                  <ListItemText primary={category.replace(/_/g, ' ')} />
                  {openFolders[category] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openFolders[category]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {sources.urls[category].map((url, index) => (
                      <ListItem key={index} sx={{ pl: 4 }}>
                        <ListItemText primary={url.name} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Modal>
  );
}
