import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

export default function QATool() {
  const [originalText, setOriginalText] = useState("");
  const [revisedText, setRevisedText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/qa-tool/upload', formData);
      if (response.status === 200) {
        setOriginalText(response.data.originalText);
        setRevisedText(response.data.revisedText);
        setError(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to process file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: '1400px', margin: '0 auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quality Assurance Tool
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          mb: 4,
          p: 4,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadIcon />}
            sx={{ mb: 2 }}
          >
            Choose File
          </Button>
        </label>
        
        {file && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selected file: {file.name}
          </Typography>
        )}
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Process Document'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Original Document
            </Typography>
            <TextField
              multiline
              fullWidth
              rows={15}
              variant="outlined"
              value={originalText || "No document uploaded"}
              InputProps={{
                readOnly: true,
                sx: { 
                  backgroundColor: 'background.default',
                  fontFamily: 'monospace'
                }
              }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Revised Document
            </Typography>
            <TextField
              multiline
              fullWidth
              rows={15}
              variant="outlined"
              value={revisedText || "No revised document available"}
              InputProps={{
                readOnly: true,
                sx: { 
                  backgroundColor: 'background.default',
                  fontFamily: 'monospace'
                }
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}