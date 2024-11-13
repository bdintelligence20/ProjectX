import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Language as WebIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../../AuthContext';

axios.defaults.baseURL = 'https://projectx-53gn.onrender.com';

const MAX_CONCURRENT_UPLOADS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const ALLOWED_FILE_TYPES = '.pdf,.csv,.docx,.eml';

export default function AddSourcesModal({ onSourceAdded, onClose }) {
  const { session } = useContext(AuthContext);
  const [activeMethod, setActiveMethod] = useState(null);
  const [sourceLinks, setSourceLinks] = useState(['']);
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('');
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});

  const urlCategories = ['Business Research', 'Competitor Analysis', 'Client Research', 'General Research'];
  const fileCategories = ['LRMG Knowledge', 'Trend Reports', 'Business Reports', 'Shareholder Reports', 'Qualitative Data', 'Quantitative Data'];

  // URL handling
  const handleLinkChange = (index, value) => {
    const newLinks = [...sourceLinks];
    newLinks[index] = value;
    setSourceLinks(newLinks);
  };

  const addLinkField = () => {
    setSourceLinks([...sourceLinks, '']);
  };

  const removeLinkField = (index) => {
    const newLinks = sourceLinks.filter((_, i) => i !== index);
    setSourceLinks(newLinks.length ? newLinks : ['']); // Keep at least one empty field
  };

  // File handling
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => {
      const isValidSize = file.size <= MAX_FILE_SIZE;
      const isValidType = ALLOWED_FILE_TYPES.includes(file.name.split('.').pop().toLowerCase());
      return isValidSize && isValidType;
    });

    if (validFiles.length < selectedFiles.length) {
      setError(`Some files were skipped due to size limit (${MAX_FILE_SIZE / (1024 * 1024)}MB) or invalid type`);
    }

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Batch processing
  const processInBatches = async (items, processFn) => {
    const results = [];
    for (let i = 0; i < items.length; i += MAX_CONCURRENT_UPLOADS) {
      const batch = items.slice(i, i + MAX_CONCURRENT_UPLOADS);
      const batchPromises = batch.map((item, batchIndex) => 
        processFn(item, i + batchIndex)
      );
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
    }
    return results;
  };

  // Upload handlers
  const uploadFile = async (file, index) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sourceType', 'file');
    formData.append('category', category);

    try {
      setUploadStatus(prev => ({ ...prev, [index]: 'uploading' }));
      
      const response = await axios.post('/add-source', formData, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [index]: percentCompleted }));
        }
      });

      setUploadStatus(prev => ({ ...prev, [index]: 'success' }));
      return response.data;
    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [index]: 'error' }));
      throw error;
    }
  };

  const uploadUrl = async (url, index) => {
    if (!url.trim()) return null;

    try {
      setUploadStatus(prev => ({ ...prev, [index]: 'uploading' }));
      setUploadProgress(prev => ({ ...prev, [index]: 50 }));
      
      const response = await axios.post('/add-source', {
        sourceType: 'url',
        content: url.trim(),
        category: category,
      }, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        }
      });

      setUploadStatus(prev => ({ ...prev, [index]: 'success' }));
      setUploadProgress(prev => ({ ...prev, [index]: 100 }));
      return response.data;
    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [index]: 'error' }));
      throw error;
    }
  };

  const handleBulkUpload = async () => {
    if (!category) {
      setError('Please select a category');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      if (activeMethod === 'website') {
        const validLinks = sourceLinks.filter(link => link.trim());
        if (!validLinks.length) {
          setError('Please enter at least one valid URL');
          return;
        }

        const results = await processInBatches(validLinks, uploadUrl);
        handleUploadResults(results);
      } else if (activeMethod === 'file') {
        if (!files.length) {
          setError('Please select at least one file');
          return;
        }

        const results = await processInBatches(files, uploadFile);
        handleUploadResults(results);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      setError('Failed to process some items. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadResults = (results) => {
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;
    
    if (successCount > 0) {
      onSourceAdded();
    }
    
    if (failureCount > 0) {
      setError(`${failureCount} item(s) failed to process. Please check the logs and try again.`);
    }
  };

  const renderUploadList = () => {
    const items = activeMethod === 'website' ? sourceLinks : files;
    
    return (
      <List>
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemText 
              primary={activeMethod === 'website' ? item : item.name}
              secondary={
                uploadStatus[index] && (
                  <LinearProgress 
                    variant="determinate"
                    value={uploadProgress[index] || 0}
                    color={
                      uploadStatus[index] === 'success' ? 'success' :
                      uploadStatus[index] === 'error' ? 'error' : 'primary'
                    }
                    sx={{ mt: 1 }}
                  />
                )
              }
            />
            <ListItemSecondaryAction>
              {uploadStatus[index] === 'success' && <CheckIcon color="success" />}
              {uploadStatus[index] === 'error' && <ErrorIcon color="error" />}
              {!uploadStatus[index] && !uploading && (
                <IconButton 
                  edge="end" 
                  onClick={() => activeMethod === 'website' ? removeLinkField(index) : removeFile(index)}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderMethodSelection = () => (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight="bold">
        Add Sources
      </Typography>
      <Typography color="text.secondary">
        Choose how you want to add sources to your library
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card
            onClick={() => setActiveMethod('website')}
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <WebIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="medium">
                  Website Links
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add multiple URLs
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card
            onClick={() => setActiveMethod('file')}
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <UploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="medium">
                  Upload Files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PDF, CSV, DOCX, EML
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderSourceForm = () => (
    <Stack spacing={3}>
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton
          onClick={() => {
            setActiveMethod(null);
            setSourceLinks(['']);
            setFiles([]);
            setError(null);
            setUploadProgress({});
            setUploadStatus({});
          }}
          size="small"
          sx={{
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="medium">
          {activeMethod === 'website' ? 'Add Website Links' : 'Upload Files'}
        </Typography>
      </Box>

      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          label="Category"
        >
          {(activeMethod === 'file' ? fileCategories : urlCategories).map((cat) => (
            <MenuItem value={cat} key={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {activeMethod === 'website' ? (
        <>
          {sourceLinks.map((link, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Website URL ${index + 1}`}
              value={link}
              onChange={(e) => handleLinkChange(index, e.target.value)}
              disabled={uploading}
              InputProps={{
                endAdornment: sourceLinks.length > 1 && !uploading && (
                  <IconButton onClick={() => removeLinkField(index)}>
                    <CloseIcon />
                  </IconButton>
                )
              }}
            />
          ))}
          {!uploading && (
            <Button 
              startIcon={<AddIcon />}
              onClick={addLinkField}
            >
              Add Another URL
            </Button>
          )}
        </>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            borderStyle: 'dashed',
            bgcolor: 'background.default',
          }}
        >
          <input
            type="file"
            multiple
            accept={ALLOWED_FILE_TYPES}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              disabled={uploading}
            >
              Choose Files
            </Button>
          </label>
        </Paper>
      )}

      {renderUploadList()}

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleBulkUpload}
        disabled={
          uploading || 
          !category || 
          (activeMethod === 'website' && !sourceLinks.some(link => link.trim())) ||
          (activeMethod === 'file' && !files.length)
        }
        sx={{
          mt: 2,
          py: 1.5,
        }}
      >
        {uploading ? 'Processing...' : 'Upload All'}
      </Button>
    </Stack>
  );

  return (
    <Box 
      sx={{ 
        width: '100%',
        maxWidth: 600,
        margin: '0 auto',
        p: 2,
      }}
    >
      {activeMethod ? renderSourceForm() : renderMethodSelection()}
    </Box>
  );
}