import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Modal,
  Button,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  TextField,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Link as LinkIcon,
  Upload as UploadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../../AuthContext';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '900px',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
};

export default function AddSourcesModal({ onSourceAdded }) {
  const { session } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null);
  const [sourceLink, setSourceLink] = useState('');
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const urlCategories = ['Business Research', 'Competitor Analysis', 'Client Research', 'General Research'];
  const fileCategories = ['LRMG Knowledge', 'Trend Reports', 'Business Reports', 'Shareholder Reports', 'Qualitative Data', 'Quantitative Data'];

  // Rest of your existing functions...

  const renderContent = () => {
    return (
      <Stack spacing={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => setActiveMethod(null)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
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
          />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
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
          <Alert severity="error">{error}</Alert>
        )}

        <Button
          variant="contained"
          onClick={handleAddSource}
          disabled={loading || !category || (!sourceLink && !file)}
        >
          {loading ? 'Processing...' : 'Submit'}
        </Button>
      </Stack>
    );
  };

  // ... rest of your component

  return (
    <Box>
      <Button
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        variant="contained"
        size="small"
      >
        Add Sources
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          {activeMethod ? (
            renderContent()
          ) : (
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="bold">
                Add Sources
              </Typography>
              <Typography color="text.secondary">
                Choose how you want to add sources to your library
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <MethodCard
                    title="Website Link"
                    icon={<LinkIcon sx={{ fontSize: 40 }} />}
                    onClick={() => setActiveMethod('website')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MethodCard
                    title="Upload File"
                    subtitle="PDF, CSV, DOCX, EML"
                    icon={<UploadIcon sx={{ fontSize: 40 }} />}
                    onClick={() => setActiveMethod('file')}
                  />
                </Grid>
              </Grid>
            </Stack>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

function MethodCard({ title, subtitle, icon, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Stack spacing={2} alignItems="center" textAlign="center">
          {icon}
          <Typography variant="h6">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}