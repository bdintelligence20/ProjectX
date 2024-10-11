import React, { useEffect, useState } from 'react';
import { Box, Typography, Modal, CircularProgress, Checkbox, FormControlLabel, Button } from '@mui/material';
import axios from 'axios';

axios.defaults.baseURL = 'https://orange-chainsaw-jj4w954456jj2jqqv-5000.app.github.dev';

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

export default function SourceLibraryModal({ open, onClose, onSourcesSelected }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSources, setSelectedSources] = useState([]);

  useEffect(() => {
    if (open) {
      const fetchSources = async () => {
        try {
          setLoading(true);
          console.log('Fetching sources from server...');
          const response = await axios.get('/sources');
          if (response.status === 200) {
            console.log('Fetched sources:', response.data);
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
  

  // Handle selecting or deselecting a source
  const handleSelectSource = (source) => {
    setSelectedSources((prevSelectedSources) => {
      if (prevSelectedSources.includes(source)) {
        return prevSelectedSources.filter((s) => s !== source);
      } else {
        return [...prevSelectedSources, source];
      }
    });
  };

  // Handle adding selected sources
  const handleAddSelectedSources = () => {
    console.log('Selected sources to add:', selectedSources);
    onSourcesSelected(selectedSources);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
          Source Library
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : sources.length > 0 ? (
          <Box>
            {sources.map((source, index) => (
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSources.includes(source)}
                      onChange={() => handleSelectSource(source)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                        {source.title}
                      </Typography>
                      {source.source_type === 'url' && source.content && (
                        <Typography variant="body2" sx={{ color: '#0073e6' }}>
                          {source.content}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </Box>
            ))}
            <Button
              variant="contained"
              onClick={handleAddSelectedSources}
              sx={{ marginTop: '20px', backgroundColor: '#0073e6' }}
              disabled={selectedSources.length === 0}
            >
              Add Selected Sources
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No sources available.
          </Typography>
        )}
      </Box>
    </Modal>
  );
}
