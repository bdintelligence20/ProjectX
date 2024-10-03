import React, { useState } from 'react';
import { Box, Typography, Modal, Button, Card, CardContent, Link, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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

export default function AddSourcesModal({ sources, setSources }) {
  const [open, setOpen] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null); // Track method of source input
  const [sourceLink, setSourceLink] = useState('');  // Store the website link input

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setActiveMethod(null);
  };

  const handleAddSource = () => {
    const newSource = {
      title: `Website: ${sourceLink}`,
      link: sourceLink,
    };
    setSources([...sources, newSource]);
    handleClose();  // Close modal after adding source
  };

  const renderContent = () => {
    switch (activeMethod) {
      case 'website':
        return (
          <>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>Upload Website Link</Typography>
            <input
              type="url"
              placeholder="https://example.com"
              value={sourceLink}
              onChange={(e) => setSourceLink(e.target.value)}
              style={{ padding: '10px', width: '100%' }}
            />
            <Button variant="contained" sx={{ backgroundColor: '#0073e6', marginTop: '20px' }} onClick={handleAddSource}>
              Submit
            </Button>
            <Button onClick={() => setActiveMethod(null)} sx={{ marginTop: '20px' }}>Back</Button>
          </>
        );
      // Handle other types (e.g., text, email, etc.) similarly
      default:
        return (
          <>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>Add sources</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '30px' }}>
              Upload sources by adding website links or pasting text.
            </Typography>
            <Box
              sx={{
                border: '2px dashed #e0e0e0',
                borderRadius: '12px',
                padding: '50px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                marginBottom: '30px',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>Upload sources</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ marginTop: '20px', gap: '20px' }}>
              <Card sx={{ border: '1px dashed #e0e0e0', borderRadius: '12px', padding: '20px', flex: '1' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Website</Typography>
                  <Button onClick={() => setActiveMethod('website')} variant="contained" sx={{ marginTop: '10px', backgroundColor: '#0073e6' }}>Website</Button>
                </CardContent>
              </Card>
            </Box>
          </>
        );
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={handleOpen}>
        <IconButton color="primary">
          <AddIcon />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0073e6' }}>Add Sources</Typography>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          {renderContent()}
        </Box>
      </Modal>
    </Box>
  );
}
