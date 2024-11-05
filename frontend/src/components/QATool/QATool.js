import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

export default function QATool() {
  const [file, setFile] = useState(null);
  const [originalFileUrl, setOriginalFileUrl] = useState('');
  const [revisedFileUrl, setRevisedFileUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/qa-tool/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setOriginalFileUrl(response.data.originalFileUrl);
      setRevisedFileUrl(response.data.revisedFileUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding="40px"
    >
      <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '36px', marginBottom: '20px' }}>
        QA Tool
      </Typography>

      <Box
        sx={{
          border: '2px dashed #c4c4c4',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '40px',
          backgroundColor: '#fff',
          width: '100%',
          maxWidth: '700px',
        }}
      >
        <Button variant="contained" component="label">
          Choose File
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          sx={{ marginTop: '20px' }}
          disabled={!file || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload and Check'}
        </Button>
      </Box>

      {originalFileUrl && revisedFileUrl && (
        <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mt={4}>
          <Box width="48%">
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
              Original Document
            </Typography>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${originalFileUrl}`}
              width="100%"
              height="500px"
              frameBorder="0"
              title="Original Document"
            ></iframe>
          </Box>

          <Box width="48%">
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
              Revised Document
            </Typography>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${revisedFileUrl}`}
              width="100%"
              height="500px"
              frameBorder="0"
              title="Revised Document"
            ></iframe>
          </Box>
        </Box>
      )}
    </Box>
  );
}
