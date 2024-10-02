import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

export default function ChatInterface() {
  const [companyUrl, setCompanyUrl] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [chatInput, setChatInput] = useState('');  // Chat input state

  const handleScrape = async () => {
    try {
      const response = await axios.post('https://orange-chainsaw-jj4w954456jj2jqqv-5000.app.github.dev/scrape', {
        companyUrl
      });
      console.log("Response from backend:", response.data);
      setResponseMessage(response.data.message + ": " + response.data.data);
    } catch (error) {
      console.error('Error scraping website:', error);
      setResponseMessage('Failed to scrape website');
    }
  };
  
  const handleChatSubmit = () => {
    // Handle the chat input submission for RAG here
    console.log("User asked:", chatInput);
    setChatInput('');
  };

  return (
    <Box 
      flex={1} 
      display="flex" 
      flexDirection="column" 
      height="100vh"  // Full height layout
      backgroundColor="#fafafa"
      sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Top section for URL input */}
      <Box flex="0 1 auto" p={2}>
        <Typography variant="h6">Enter Company URL</Typography>
        <Box mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            label="Company URL"
            placeholder="https://www.example.com"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
          />
        </Box>
        <Button variant="contained" color="primary" onClick={handleScrape}>Scrape Website</Button>
        {responseMessage && (
          <Box mt={2}>
            <Typography variant="body1">{responseMessage}</Typography>
          </Box>
        )}
      </Box>

      {/* Middle section for chat messages */}
      <Box flex="1 1 auto" p={2} overflow="auto">
        <Typography variant="h6">Chat History</Typography>
        {/* Placeholder for chat history */}
        <Box mb={2}>
          <Typography variant="body1" sx={{ backgroundColor: '#dfe9f3', borderRadius: '16px', padding: '10px', margin: '5px 0' }}>
            This is where chat history will go.
          </Typography>
        </Box>
      </Box>

      {/* Bottom section for chat input */}
      <Box flex="0 1 80px" p={2} display="flex" alignItems="center" borderTop="1px solid #ddd">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask a question..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}  // Update chat input value
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleChatSubmit();  // Submit on Enter key
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
