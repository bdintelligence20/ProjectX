// AddSourcesModal.js
import React, { useState, useContext } from 'react';
import { Box, Typography, Modal, Button, Card, CardContent, IconButton, Select, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import AuthContext from '../../AuthContext'; // Import AuthContext

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

export default function AddSourcesModal({ onSourceAdded }) {
  const { session } = useContext(AuthContext);  // Get session from AuthContext
  const [open, setOpen] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null);  // Track method of source input
  const [sourceLink, setSourceLink] = useState('');  // Store the website link input
  const [file, setFile] = useState(null);  // Store uploaded file
  const [category, setCategory] = useState(''); // Store selected category

  // List of categories for URLs
  const urlCategories = ['Business Research', 'Competitor Analysis', 'Client Research', 'General Research'];

  // List of categories for Files
  const fileCategories = ['LRMG Knowledge', 'Trend Reports', 'Business Reports', 'Shareholder Reports', 'Qualitative Data', 'Quantitative Data'];

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSourceLink('');
    setFile(null);
    setCategory('');  // Reset the category
  };

  const handleAddSource = async () => {
    const token = session?.access_token;  // Get the JWT token from the session

    // Ensure token exists
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    // Set headers with the token for authorization
    const headers = {
      'Authorization': `Bearer ${token}`  // Pass the token in the request headers
    };

    // Process URL or file upload based on selected method and category
    if (sourceLink && category) {
      try {
        const response = await axios.post('/add-source', {
          sourceType: 'url',
          content: sourceLink,
          category: category,  // Pass the selected category
        }, { headers });

        onSourceAdded(response.data);
        handleClose();
      } catch (error) {
        console.error('Failed to upload URL:', error);
      }
    } else if (file && category) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sourceType', 'file');
      formData.append('category', category);  // Pass the selected category

      try {
        const response = await axios.post('/add-source', formData, { headers });
        onSourceAdded(response.data);
        handleClose();
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  // Render content based on the method
  const renderContent = () => {
    return (
      <Box>
        {/* Category Selection */}
        <Select value={category} onChange={(e) => setCategory(e.target.value)} fullWidth>
          {(activeMethod === 'file' ? fileCategories : urlCategories).map((cat) => (
            <MenuItem value={cat} key={cat}>{cat}</MenuItem>
          ))}
        </Select>

        {activeMethod === 'website' && (
          <Box>
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
          </Box>
        )}

        {activeMethod === 'file' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>Upload File</Typography>
            <input
              type="file"
              accept=".pdf,.csv,.docx,.eml"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button variant="contained" sx={{ backgroundColor: '#0073e6', marginTop: '20px' }} onClick={handleAddSource} disabled={!file}>
              Submit
            </Button>
          </Box>
        )}
      </Box>
    );
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
          {activeMethod ? (
            renderContent()
          ) : (
            <Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>Add sources</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '30px' }}>
                Upload sources by adding website links, files, or pasting text.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                <CardOption title="Website" onClick={() => setActiveMethod('website')} />
                <CardOption title="File (PDF, CSV, DOCX, EML)" onClick={() => setActiveMethod('file')} />
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

// Helper CardOption component for reusability
const CardOption = ({ title, onClick }) => (
  <Card
    sx={{
      border: '1px dashed #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      flex: '1',
      textAlign: 'center',
      cursor: 'pointer',
    }}
    onClick={onClick}
  >
    <CardContent>
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{title}</Typography>
    </CardContent>
  </Card>
);


