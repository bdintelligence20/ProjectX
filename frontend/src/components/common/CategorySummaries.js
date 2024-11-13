import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
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
        {summaries.map((summary, index) => (
          <React.Fragment key={summary.id}>
            <ListItem>
              <Paper elevation={0} sx={{ width: '100%', p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Source: {summary.source_id}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <ReactMarkdown>
                    {summary.summary}
                  </ReactMarkdown>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Added: {new Date(summary.created_at).toLocaleDateString()}
                </Typography>
              </Paper>
            </ListItem>
            {index < summaries.length - 1 && <Divider />}
          </React.Fragment>
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