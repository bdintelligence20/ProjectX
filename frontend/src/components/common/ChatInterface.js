import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

export default function ChatInterface({ sources }) {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleChatSubmit = async () => {
    if (!sources.length) {
      console.log("No sources available to query.");
      return;
    }

    console.log("Submitting user query:", chatInput);
    try {
      // Add user input to chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", content: chatInput }
      ]);

      // Send the user query and sources to the backend for RAG
      const response = await axios.post('/query', {
        userQuestion: chatInput,
        sources: sources.map((source) => source.link)  // Sending source links for querying
      });

      console.log("Response from backend:", response.data);

      // Add LLM response to chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "system", content: response.data.answer }
      ]);

      setChatInput('');  // Clear input after submission
    } catch (error) {
      console.error('Error querying:', error);
    }
  };

  return (
    <Box 
      flex={1} 
      display="flex" 
      flexDirection="column" 
      height="100vh"  
      backgroundColor="#fafafa"
    >
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
