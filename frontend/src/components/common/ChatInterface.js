import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

export default function ChatInterface() {
  const [companyUrl, setCompanyUrl] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleScrape = async () => {
    try {
      const response = await axios.post('/scrape', { companyUrl });
      console.log("Response from backend:", response.data);
    } catch (error) {
      console.error('Error scraping website:', error);
    }
  };

  const handleChatSubmit = async () => {
    try {
      // Add user input to chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", content: chatInput }
      ]);

      // Send the user query and company URL to the backend for RAG
      const response = await axios.post('/query', {
        companyUrl,
        userQuestion: chatInput
      });

      // Add LLM response to chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "system", content: response.data.answer }
      ]);

      setChatInput('');
    } catch (error) {
      console.error('Error querying:', error);
    }
  };

  return (
    <Box 
      flex={1} 
      display="flex" 
      flexDirection="column" 
      height="100vh"  // Full height layout
      backgroundColor="#fafafa"
    >
      <Box flex="0 1 auto" p={2}>
        <Typography variant="h6">Enter Company URL</Typography>
        <TextField
          fullWidth
          variant="outlined"
          label="Company URL"
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleScrape}>Scrape Website</Button>
      </Box>

      <Box flex="1 1 auto" p={2} overflow="auto">
        <Typography variant="h6">Chat History</Typography>
        <Box>
          {chatHistory.map((message, index) => (
            <Box key={index} mb={2}>
              <Typography
                variant="body1"
                sx={{
                  backgroundColor: message.role === "user" ? '#dfe9f3' : '#f3e9df',
                  borderRadius: '16px',
                  padding: '10px',
                  margin: '5px 0'
                }}
              >
                {message.content}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box flex="0 1 80px" p={2} display="flex" alignItems="center" borderTop="1px solid #ddd">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask a question..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleChatSubmit();
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
