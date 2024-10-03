import React, { useState } from 'react';
import { Box, Typography, Modal, Button, Card, CardContent, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
};

export default function AddSourcesModal({ onSourceAdded }) {
  const [open, setOpen] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null);  // Track method of source input
  const [sourceLink, setSourceLink] = useState('');  // Store the website link input
  const [file, setFile] = useState(null);  // Store uploaded file
  const [pastedText, setPastedText] = useState('');  // Store pasted text
  const [statusMessage, setStatusMessage] = useState('');  // To provide feedback

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setActiveMethod(null);
    setSourceLink('');  // Reset inputs when modal closes
    setFile(null);
    setPastedText('');
    setStatusMessage('');  // Reset the status message
  };

  // Handle website link addition
  const handleAddSource = async () => {
    if (sourceLink.trim()) {
      try {
        setStatusMessage('Processing website link...');

        const response = await axios.post('/add-source', {
          sourceType: 'url',
          content: sourceLink,
        });

        if (response.status === 200) {
          const newSource = {
            title: `Website: ${sourceLink}`,
            link: sourceLink,
          };
          onSourceAdded(newSource);  // Add new source via the prop function
          setStatusMessage('Website link processed successfully!');
          handleClose();
        } else {
          setStatusMessage('Failed to process website link.');
        }
      } catch (error) {
        setStatusMessage('Error processing website link.');
      }
    }
  };

  // Handle file addition
  const handleFileUpload = async () => {
    if (file) {
      try {
        setStatusMessage('Processing file...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('sourceType', 'file');

        const response = await axios.post('/add-source', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          const newSource = {
            title: `File: ${file.name}`,
            file: file,
          };
          onSourceAdded(newSource);
          setStatusMessage('File processed successfully!');
          handleClose();
        } else {
          setStatusMessage('Failed to process file.');
        }
      } catch (error) {
        setStatusMessage('Error processing file.');
      }
    }
  };

  // Handle pasted text addition
  const handleAddPastedText = async () => {
    if (pastedText.trim()) {
      try {
        setStatusMessage('Processing pasted text...');

        const response = await axios.post('/add-source', {
          sourceType: 'text',
          content: pastedText,
        });

        if (response.status === 200) {
          const newSource = {
            title: 'Pasted Text',
            text: pastedText,
          };
          onSourceAdded(newSource);
          setStatusMessage('Pasted text processed successfully!');
          handleClose();
        } else {
          setStatusMessage('Failed to process pasted text.');
        }
      } catch (error) {
        setStatusMessage('Error processing pasted text.');
      }
    }
  };

  // Render content based on selected input method
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
            <Button
              variant="contained"
              sx={{ backgroundColor: '#0073e6', marginTop: '20px' }}
              onClick={handleAddSource}
            >
              Submit
            </Button>
            <Button onClick={() => setActiveMethod(null)} sx={{ marginTop: '20px' }}>
              Back
            </Button>
          </>
        );
      case 'file':
        return (
          <>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>Upload File</Typography>
            <input
              type="file"
              accept=".pdf,.csv,.docx,.eml"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: '#0073e6', marginTop: '20px' }}
              onClick={handleFileUpload}
              disabled={!file}  // Disable button if no file is selected
            >
              Submit
            </Button>
            <Button onClick={() => setActiveMethod(null)} sx={{ marginTop: '20px' }}>
              Back
            </Button>
          </>
        );
      case 'text':
        return (
          <>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>Paste Copied Text</Typography>
            <textarea
              placeholder="Paste your text here..."
              rows="6"
              style={{ padding: '10px', width: '100%' }}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: '#0073e6', marginTop: '20px' }}
              onClick={handleAddPastedText}
              disabled={!pastedText.trim()}  // Disable if no text is pasted
            >
              Submit
            </Button>
            <Button onClick={() => setActiveMethod(null)} sx={{ marginTop: '20px' }}>
              Back
            </Button>
          </>
        );
      default:
        return (
          <>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>Add sources</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '30px' }}>
              Upload sources by adding website links, files, or pasting text.
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
              <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
                Upload sources
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ marginTop: '20px', gap: '20px' }}>
              <Card
                sx={{
                  border: '1px dashed #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  flex: '1',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Website</Typography>
                  <Button
                    onClick={() => setActiveMethod('website')}
                    variant="contained"
                    sx={{ marginTop: '10px', backgroundColor: '#0073e6' }}
                  >
                    Website
                  </Button>
                </CardContent>
              </Card>
              <Card
                sx={{
                  border: '1px dashed #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  flex: '1',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>File (PDF, CSV, DOCX, EML)</Typography>
                  <Button
                    onClick={() => setActiveMethod('file')}
                    variant="contained"
                    sx={{ marginTop: '10px', backgroundColor: '#0073e6' }}
                  >
                    File
                  </Button>
                </CardContent>
              </Card>
              <Card
                sx={{
                  border: '1px dashed #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  flex: '1',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Pasted Text</Typography>
                  <Button
                    onClick={() => setActiveMethod('text')}
                    variant="contained"
                    sx={{ marginTop: '10px', backgroundColor: '#0073e6' }}
                  >
                    Pasted Text
                  </Button>
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
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0073e6' }}>
          Add Sources
        </Typography>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          {renderContent()}
        </Box>
      </Modal>
    </Box>
  );
}
