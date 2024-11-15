import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function QATool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    const allowedTypes = ['pdf', 'docx', 'pptx', 'txt'];
    
    if (!allowedTypes.includes(fileType)) {
      setError("Unsupported file type. Please upload PDF, DOCX, PPTX, or TXT files.");
      return;
    }

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
      if (response.data.success) {
        setProcessedData(response.data);
        setError(null);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setError(error.response?.data?.error || "Failed to process file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderProcessedText = (text, changes = [], isOriginal = true) => {
    if (!text) return null;

    let displayText = text;
    if (!isOriginal && changes.length > 0) {
      // Sort changes in reverse order to maintain correct positions
      const sortedChanges = [...changes].sort((a, b) => b.position - a.position);
      
      // Apply highlighting to changes
      sortedChanges.forEach(change => {
        const before = displayText.slice(0, change.position);
        const after = displayText.slice(change.position + change.length);
        const content = displayText.slice(change.position, change.position + change.length);
        
        const highlightedContent = `<span 
          class="highlighted-change" 
          style="background-color: ${getHighlightColor(change.type)}; 
          position: relative;"
          title="${getChangeDescription(change)}"
        >${content || change.revised}</span>`;
        
        displayText = before + highlightedContent + after;
      });
    }

    // Convert markdown-like formatting if present
    const sanitizedHtml = DOMPurify.sanitize(marked(displayText));

    return (
      <Box
        sx={{
          fontFamily: 'inherit',
          backgroundColor: '#fff',
          borderRadius: '8px',
          p: 3,
          height: '600px',
          overflow: 'auto',
          '& .highlighted-change': {
            cursor: 'pointer',
            '&:hover::after': {
              content: 'attr(title)',
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
            },
          },
          '& p': { marginBottom: '1em' },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            marginBottom: '0.5em',
            marginTop: '1em',
            fontWeight: 600,
          },
          '& ul, & ol': {
            marginLeft: '1.5em',
            marginBottom: '1em',
          },
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  };

  const getHighlightColor = (changeType) => {
    const colors = {
      replace: 'rgba(220, 38, 38, 0.1)',  // red
      insert: 'rgba(22, 163, 74, 0.1)',   // green
      delete: 'rgba(249, 115, 22, 0.1)',  // orange
    };
    return colors[changeType] || colors.replace;
  };

  const getChangeDescription = (change) => {
    const descriptions = {
      replace: `Changed "${change.original}" to "${change.revised}"`,
      insert: `Added "${change.revised}"`,
      delete: `Removed "${change.original}"`,
    };
    return descriptions[change.type] || 'Modified text';
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '1400px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
        Quality Assurance Tool
      </Typography>
      
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Upload your document to check for quality, grammar, and structural improvements
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          mb: 4,
          p: 4,
          border: '1px solid',
          borderColor: 'rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          textAlign: 'center',
          backgroundColor: 'rgba(59, 130, 246, 0.02)',
        }}
      >
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".pdf,.docx,.pptx,.txt"
        />
        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadIcon />}
            sx={{
              mb: 2,
              borderColor: 'rgba(59, 130, 246, 0.3)',
              color: '#3b82f6',
              '&:hover': {
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
              }
            }}
          >
            Choose File
          </Button>
        </label>
        
        {file && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 2 }}>
              Selected file: {file.name}
            </Typography>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
                minWidth: 180
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Processing...</span>
                </Box>
              ) : 'Process Document'}
            </Button>
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              borderRadius: 2
            }}
          >
            {error}
          </Alert>
        )}
      </Paper>

      {processedData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Original Document
                </Typography>
              </Box>
              {renderProcessedText(processedData.originalText, [], true)}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Revised Document
                </Typography>
              </Box>
              {renderProcessedText(processedData.revisedText, processedData.changes, false)}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}