import React, { useState } from 'react';
import { Box, Typography, Link, IconButton, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataSummary from './DataSummary';
import ViewData from './ViewData';
import CustomModal from '../modals/CustomModal';
import AddSourcesModalContent from '../modals/AddSourcesModal'; // Import your AddSources modal content

// Sample data for sources and tags
const sources = [
  { title: "DigitalCampus.csv" }
];

const tags = [
  "Segmentation", "World Cloud", "Common Themes", "NER", "Sentiment Analysis", "Clustering", "Data Visualisation"
];

export default function DataAnalysisRightColumn() {
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [ModalContent, setModalContent] = useState(null);

  // Open modal with dynamic content
  const handleOpen = (title, Component) => {
    setModalTitle(title);
    setModalContent(<Component />);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <Box 
      flex="0 0 300px" 
      display="flex" 
      flexDirection="column" 
      padding="20px" 
      backgroundColor="#f9f9f9"
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Sources Section */}
      <Box padding="10px" mb={2}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>Sources</Typography>
        {sources.map((source, index) => (
          <Box 
            key={index} 
            sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box flexGrow={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>{source.title}</Typography>
            </Box>
          </Box>
        ))}
        <Box display="flex" alignItems="center">
          <IconButton color="primary" onClick={() => handleOpen('Add Sources', AddSourcesModalContent)}>
            <AddIcon />
          </IconButton>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0073e6', cursor: 'pointer' }} onClick={() => handleOpen('Add Sources', AddSourcesModalContent)}>
            Add Sources
          </Typography>
        </Box>
      </Box>

      {/* Tags Section */}
      <Box padding="10px" mb={2}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>Tags</Typography>
        <Box display="flex" flexWrap="wrap" gap={1.5}>
          {tags.map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              sx={{
                backgroundColor: '#d4f1c5',  // Light green background
                color: '#333',
                fontWeight: 'bold',
                borderRadius: '16px',  // Rounded corners
                padding: '0 8px',
                fontSize: '0.875rem'
              }} 
            />
          ))}
        </Box>
      </Box>

      {/* Data Summary and View Data Links */}
      <Box display="flex" flexDirection="column" mt={2}>
        <Link onClick={() => handleOpen('Data Summary', DataSummary)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb: 1, fontWeight: 'bold', cursor: 'pointer' }}>
          Data Summary <AddIcon fontSize="small" sx={{ ml: 'auto' }} />
        </Link>
        <Link onClick={() => handleOpen('View Data', ViewData)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb: 1, fontWeight: 'bold', cursor: 'pointer' }}>
          View Data <AddIcon fontSize="small" sx={{ ml: 'auto' }} />
        </Link>
      </Box>

      {/* Custom Modal */}
      <CustomModal open={open} handleClose={handleClose} title={modalTitle}>
        {ModalContent}
      </CustomModal>
    </Box>
  );
}
