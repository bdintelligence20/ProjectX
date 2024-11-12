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
  Grid,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Language as WebIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../../AuthContext';

axios.defaults.baseURL = 'https://projectx-53gn.onrender.com';

export default function AddSourcesModal({ onSourceAdded, onClose }) {
  const { session } = useContext(AuthContext);
  const [activeMethod, setActiveMethod] = useState(null);
  const [sourceLink, setSourceLink] = useState('');
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // List of categories
  const urlCategories = ['Business Research', 'Competitor Analysis', 'Client Research', 'General Research'];
  const fileCategories = ['LRMG Knowledge', 'Trend Reports', 'Business Reports', 'Shareholder Reports', 'Qualitative Data', 'Quantitative Data'];

  const handleAddSource = async () => {
    setLoading(true);
    setError(null);
    const token = session?.access_token;

    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    try {
      if (activeMethod === 'website' && sourceLink && category) {
        const response = await axios.post('/add-source', {
          sourceType: 'url',
          content: sourceLink,
          category: category,
        }, { headers });

        onSourceAdded(response.data);
        onClose();
      } else if (activeMethod === 'file' && file && category) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sourceType', 'file');
        formData.append('category', category);

        const response = await axios.post('/add-source', formData, {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          }
        });

        onSourceAdded(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Failed to add source:', error);
      setError(error.response?.data?.error || error.message || 'Failed to add source');
    } finally {
      setLoading(false);
    }
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
        <Grid xs={12} sm={6}>
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
                  Website Link
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6}>
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
                  Upload File
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
          onClick={() => setActiveMethod(null)}
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
          {activeMethod === 'website' ? 'Add Website Link' : 'Upload File'}
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
        <TextField
          fullWidth
          label="Website URL"
          placeholder="https://example.com"
          value={sourceLink}
          onChange={(e) => setSourceLink(e.target.value)}
          type="url"
          error={Boolean(error)}
          helperText={error}
        />
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            borderStyle: 'dashed',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.csv,.docx,.eml"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
            >
              Choose File
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected: {file.name}
            </Typography>
          )}
        </Paper>
      )}

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleAddSource}
        disabled={loading || !category || (!sourceLink && !file)}
        sx={{
          mt: 2,
          py: 1.5,
          position: 'relative',
          '&.Mui-disabled': {
            backgroundColor: 'action.disabledBackground',
          },
        }}
      >
        {loading ? 'Processing...' : 'Add Source'}
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