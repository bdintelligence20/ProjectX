import React, { useState } from 'react';
import { Box, Typography, Modal, Button, Card, CardContent, Link, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Styles for modal
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

export default function AddSourcesModal() {
  const [open, setOpen] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null); // Manage which method is active

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setActiveMethod(null); // Reset the method when modal closes
  };

  // Method to render different content based on the selected method
  const renderContent = () => {
    switch (activeMethod) {
      case 'website':
        return (
          <>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>Upload Website Link</Typography>
            <Typography variant="body2" sx={{ marginBottom: '20px' }}>
              Enter the URL of the website you'd like to upload:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input type="url" placeholder="https://example.com" style={{ padding: '10px', width: '100%' }} />
              <Button variant="contained" sx={{ backgroundColor: '#0073e6' }}>Submit</Button>
            </Box>
            <Button onClick={() => setActiveMethod(null)}>Back</Button>
          </>
        );
      case 'text':
        return (
          <>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>Paste Copied Text</Typography>
            <Typography variant="body2" sx={{ marginBottom: '20px' }}>
              Paste the copied text you'd like to upload:
            </Typography>
            <textarea placeholder="Paste your text here..." rows="6" style={{ padding: '10px', width: '100%' }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button variant="contained" sx={{ backgroundColor: '#0073e6' }}>Submit</Button>
            </Box>
            <Button onClick={() => setActiveMethod(null)}>Back</Button>
          </>
        );
      case 'eml':
        return (
          <>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>Upload EML File</Typography>
            <Typography variant="body2" sx={{ marginBottom: '20px' }}>
              Select and upload an EML file (email format):
            </Typography>
            <input type="file" accept=".eml" />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button variant="contained" sx={{ backgroundColor: '#0073e6' }}>Submit</Button>
            </Box>
            <Button onClick={() => setActiveMethod(null)}>Back</Button>
          </>
        );
      default:
        return (
          <>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>Add sources</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '30px' }}>
              In this modal, users can upload sources by dragging and dropping or selecting files in PDF, CSV, and DOCX formats, 
              inputting website links, pasting copied text, or uploading email files in EML format.
            </Typography>

            {/* Drag & Drop Area */}
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
              <Typography variant="body2" sx={{ marginBottom: '10px' }}>Drag & Drop or <Link href="#">choose file</Link> to upload</Typography>
              <Typography variant="body2" color="textSecondary">PDF, CSV, DOCS</Typography>
            </Box>

            {/* Different Source Types */}
            <Box display="flex" justifyContent="space-between" sx={{ marginTop: '20px', gap: '20px' }}>
              <Card sx={{ border: '1px dashed #e0e0e0', borderRadius: '12px', padding: '20px', flex: '1' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Link</Typography>
                  <Button onClick={() => setActiveMethod('website')} variant="contained" sx={{ marginTop: '10px', backgroundColor: '#0073e6' }}>Website</Button>
                </CardContent>
              </Card>
              <Card sx={{ border: '1px dashed #e0e0e0', borderRadius: '12px', padding: '20px', flex: '1' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Paste Text</Typography>
                  <Button onClick={() => setActiveMethod('text')} variant="contained" sx={{ marginTop: '10px', backgroundColor: '#0073e6' }}>Copied text</Button>
                </CardContent>
              </Card>
              <Card sx={{ border: '1px dashed #e0e0e0', borderRadius: '12px', padding: '20px', flex: '1' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Email files</Typography>
                  <Button onClick={() => setActiveMethod('eml')} variant="contained" sx={{ marginTop: '10px', backgroundColor: '#0073e6' }}>EML file type</Button>
                </CardContent>
              </Card>
            </Box>
          </>
        );
    }
  };

  return (
    <Box>
      {/* Add Sources Button */}
      <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={handleOpen}>
        <IconButton color="primary">
          <AddIcon />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0073e6' }}>
          Add Sources
        </Typography>
      </Box>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          {renderContent()}
        </Box>
      </Modal>
    </Box>
  );
}
