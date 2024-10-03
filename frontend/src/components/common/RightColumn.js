import React, { useState } from 'react';
import { Box, Typography, Link, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CustomModal from '../modals/CustomModal';
import FullCompanySummary from '../BusinessDevelopmentResearch/FullCompanySummary';
import AnnualReports from '../BusinessDevelopmentResearch/AnnualReports';
import TopContacts from '../BusinessDevelopmentResearch/TopContacts';
import HubspotActivity from '../BusinessDevelopmentResearch/HubspotActivity';
import AddSourcesModal from '../modals/AddSourcesModal'; // Updated import

export default function RightColumn() {
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [ModalContent, setModalContent] = useState(null);
  const [sources, setSources] = useState([]); // Start with an empty array for sources

  // Open modal with dynamic content
  const handleOpen = (title, Component) => {
    setModalTitle(title);
    setModalContent(<Component />);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Callback function to handle new sources added from the AddSourcesModal
  const handleSourceAdded = (newSource) => {
    setSources((prevSources) => [
      ...prevSources,
      newSource // Add the new source to the list
    ]);
  };

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
        {sources.length > 0 ? (
          sources.map((source, index) => (
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
                {source.subtitle && <Typography variant="body2" sx={{ color: '#666' }}>{source.subtitle}</Typography>}
                {source.link && (
                  <Link href={source.link} underline="hover" sx={{ fontSize: '0.875rem', color: '#0073e6' }}>
                    {source.link}
                  </Link>
                )}
              </Box>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No sources added yet.
          </Typography>
        )}

        <Box display="flex" alignItems="center">
          <IconButton color="primary" onClick={() => handleOpen('Add Sources', () => <AddSourcesModal onSourceAdded={handleSourceAdded} />)}>
            <AddIcon />
          </IconButton>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0073e6', cursor: 'pointer' }} onClick={() => handleOpen('Add Sources', () => <AddSourcesModal onSourceAdded={handleSourceAdded} />)}>
            Add Sources
          </Typography>
        </Box>
      </Box>

      {/* Company Summary Section */}
      <Box padding="10px" mt={3} backgroundColor="#fff" borderRadius="10px" sx={{ border: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <img src="/path/to/mtn-logo.png" alt="MTN Logo" style={{ width: '60px' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Company Summary</Typography>
        <Typography variant="body2" sx={{ marginTop: '10px', color: '#666' }}>Current State of AI:</Typography>
        <ul>
          <li>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Lack of Subjective Experience: Presently, AI lacks the capacity for subjective experience.
            </Typography>
          </li>
        </ul>

        {/* Link Section */}
        <Box display="flex" flexDirection="column" mt={2}>
          <Link onClick={() => handleOpen('Full Company Summary', FullCompanySummary)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb={1}, fontWeight: 'bold', cursor: 'pointer' }}>
            Full Company Summary <ArrowForwardIosIcon fontSize="small" sx={{ ml: 'auto' }} />
          </Link>
          <Link onClick={() => handleOpen('Annual Reports', AnnualReports)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb={1}, fontWeight: 'bold', cursor: 'pointer' }}>
            Annual Reports <ArrowForwardIosIcon fontSize="small" sx={{ ml: 'auto' }} />
          </Link>
          <Link onClick={() => handleOpen('Top Contacts', TopContacts)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb={1}, fontWeight: 'bold', cursor: 'pointer' }}>
            Top Contacts <ArrowForwardIosIcon fontSize="small" sx={{ ml: 'auto' }} />
          </Link>
          <Link onClick={() => handleOpen('Hubspot Activity', HubspotActivity)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb={1}, fontWeight: 'bold', cursor: 'pointer' }}>
            Hubspot Activity <ArrowForwardIosIcon fontSize="small" sx={{ ml: 'auto' }} />
          </Link>
        </Box>
      </Box>

      {/* Custom Modal */}
      <CustomModal open={open} handleClose={handleClose} title={modalTitle}>
        {ModalContent}
      </CustomModal>
    </Box>
  );
}
