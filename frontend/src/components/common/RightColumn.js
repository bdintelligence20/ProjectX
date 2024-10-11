import React, { useState } from 'react';
import { Box, Typography, Link, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import CustomModal from '../modals/CustomModal';
import FullCompanySummary from '../BusinessDevelopmentResearch/FullCompanySummary';
import AnnualReports from '../BusinessDevelopmentResearch/AnnualReports';
import TopContacts from '../BusinessDevelopmentResearch/TopContacts';
import HubspotActivity from '../BusinessDevelopmentResearch/HubspotActivity';
import AddSourcesModal from '../modals/AddSourcesModal';
import SourceLibraryModal from '../modals/SourceLibraryModal';

export default function RightColumn({ sources, onSourceAdded }) {
  const [selectedSources, setSelectedSources] = useState(sources);
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [ModalContent, setModalContent] = useState(null);

  // Correct handleOpen for dynamic modal content
  const handleOpen = (title, Component) => {
    setModalTitle(title);
    setOpen(true);
    setModalContent(
      <Component
        open={true}
        onClose={handleClose}
        onSourcesSelected={handleSourcesSelected}
      />
    );
  };

  const handleClose = () => setOpen(false);

  // Handle adding selected sources from the library
  const handleSourcesSelected = (newSources) => {
    setSelectedSources((prevSources) => [...prevSources, ...newSources]);
  };

  // Handle removing a source from the right column (not the library)
  const handleRemoveSource = (sourceToRemove) => {
    setSelectedSources((prevSources) =>
      prevSources.filter((source) => source.id !== sourceToRemove.id)
    );
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
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Sources Section */}
      <Box padding="10px" mb={2}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Sources
        </Typography>
        {selectedSources.length > 0 ? (
          selectedSources.map((source, index) => (
            <Box
              key={index}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box flexGrow={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {source.title}
                </Typography>
                {source.link && (
                  <Link href={source.link} underline="hover" sx={{ fontSize: '0.875rem', color: '#0073e6' }}>
                    {source.link}
                  </Link>
                )}
              </Box>
              <IconButton
                onClick={() => handleRemoveSource(source)}
                sx={{ color: '#e53935' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No sources added yet.
          </Typography>
        )}

        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen('Add Sources', () => <AddSourcesModal onSourceAdded={onSourceAdded} />)}
            sx={{ backgroundColor: '#0073e6', color: '#fff' }}
          >
            Add Sources
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              console.log("View Source Library button clicked");
              handleOpen('Source Library', SourceLibraryModal);
            }}
            sx={{ color: '#0073e6', borderColor: '#0073e6' }}
          >
            View Source Library
          </Button>
        </Box>
      </Box>

      {/* Company Summary Section */}
      <Box padding="10px" mt={3} backgroundColor="#fff" borderRadius="10px" sx={{ border: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <img src="/path/to/mtn-logo.png" alt="MTN Logo" style={{ width: '60px' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Company Summary
        </Typography>
        <Typography variant="body2" sx={{ marginTop: '10px', color: '#666' }}>
          Current State of AI:
        </Typography>
        <ul>
          <li>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Lack of Subjective Experience: Presently, AI lacks the capacity for subjective experience.
            </Typography>
          </li>
        </ul>

        {/* Link Section */}
        <Box display="flex" flexDirection="column" mt={2}>
          <Link onClick={() => handleOpen('Full Company Summary', FullCompanySummary)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb: 1, fontWeight: 'bold', cursor: 'pointer' }}>
            Full Company Summary <ArrowForwardIosIcon fontSize="small" sx={{ ml: 'auto' }} />
          </Link>
          <Link onClick={() => handleOpen('Annual Reports', AnnualReports)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb: 1, fontWeight: 'bold', cursor: 'pointer' }}>
            Annual Reports <ArrowForwardIosIcon fontSize="small" sx={{ ml: 'auto' }} />
          </Link>
          <Link onClick={() => handleOpen('Top Contacts', TopContacts)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb: 1, fontWeight: 'bold', cursor: 'pointer' }}>
            Top Contacts <ArrowForwardIosIcon fontSize="small" sx={{ ml: 'auto' }} />
          </Link>
          <Link onClick={() => handleOpen('Hubspot Activity', HubspotActivity)} underline="none" sx={{ display: 'flex', alignItems: 'center', color: '#0073e6', mb: 1, fontWeight: 'bold', cursor: 'pointer' }}>
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
