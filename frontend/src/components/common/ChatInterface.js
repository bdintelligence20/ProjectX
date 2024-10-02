import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

export default function ChatInterface() {
  const [companyUrl, setCompanyUrl] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isScraped, setIsScraped] = useState(false); // Track if the website has been scraped

  const handleScrape = async () => {
    console.log('Starting scrape for:', companyUrl);  // Log company URL being scraped
    try {
      const response = await axios.post('https://orange-chainsaw-jj4w954456jj2jqqv-5000.app.github.dev/scrape', { companyUrl });
      console.log("Response from backend:", response.data);
      setIsScraped(true);  // Mark scraping as completed
    } catch (error) {
      console.error('Error scraping website:', error);
      setIsScraped(false);  // Reset scrape status on error
    }
  };

  const handleChatSubmit = async () => {
    if (!isScraped) {
      console.log('Cannot query. Scraping is not completed yet.');
      return;
    }

    console.log("Submitting user query:", chatInput);  // Log user question
    try {
      // Add user input to chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", content: chatInput }
      ]);

      // Send the user query and company URL to the backend for RAG
      const response = await axios.post('https://orange-chainsaw-jj4w954456jj2jqqv-5000.app.github.dev/query', {
        companyUrl,
        userQuestion: chatInput
      });

      console.log("Response from backend:", response.data);  // Log response from backend

      // Add LLM response to chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "system", content: response.data.answer }
      ]);

      setChatInput('');  // Clear chat input after submission
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
      {/* Section for entering company URL */}
      <Box flex="0 1 auto" p={2}>
        <Typography variant="h6">Enter Company URL</Typography>
        <TextField
          fullWidth
          variant="outlined"
          label="Company URL"
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleScrape}
        >
          Scrape Website
        </Button>
      </Box>

      {/* Chat history display */}
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

      {/* Chat input field */}
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
