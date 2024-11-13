import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function CategorySummaries({ category, onClose }) {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/summaries/${category}`);
        setSummaries(response.data);
      } catch (error) {
        console.error('Error fetching summaries:', error);
        setError('Failed to load summaries');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [category]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <List>
        {summaries.map((summary) => (
          <Paper 
            key={summary.id} 
            elevation={0} 
            className="summary-paper"
            sx={{ 
              mb: 2, 
              p: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '8px'
            }}
          >
            <Typography 
              variant="subtitle2" 
              className="summary-title"
              gutterBottom
            >
              Source: {summary.source_id}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <ReactMarkdown className="markdown-content">
                {summary.summary}
              </ReactMarkdown>
            </Box>
            <Typography 
              variant="caption" 
              className="summary-date"
              sx={{ mt: 2, display: 'block' }}
            >
              Added: {new Date(summary.created_at).toLocaleDateString()}
            </Typography>
          </Paper>
        ))}
        {summaries.length === 0 && (
          <Typography color="text.secondary" align="center">
            No summaries available for this category yet.
          </Typography>
        )}
      </List>
    </Box>
  );
}