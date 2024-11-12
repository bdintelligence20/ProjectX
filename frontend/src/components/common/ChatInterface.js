import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Divider,
  Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

export default function ChatInterface() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    try {
      // Add user message
      setChatHistory(prev => [...prev, { role: "user", content: chatInput }]);
      setIsTyping(true);

      // Prepare and send request
      const payload = {
        userQuestion: chatInput,
        searchScope: "whole",
      };

      const response = await axios.post('/query', payload);

      // Add AI response
      setChatHistory(prev => [...prev, { role: "system", content: response.data.answer }]);
      setChatInput('');
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [
        ...prev,
        { role: "system", content: "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const MessageBubble = ({ message, isUser }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        mb: 2,
        ...(isUser && { flexDirection: 'row-reverse' })
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 32,
          height: 32,
          mr: isUser ? 0 : 1,
          ml: isUser ? 1 : 0
        }}
      >
        {isUser ? <PersonIcon /> : <SmartToyIcon />}
      </Avatar>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '70%',
          borderRadius: 2,
          bgcolor: isUser ? 'primary.light' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary'
        }}
      >
        <Typography variant="body1">
          {message.content}
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.default'
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h6">Chat Assistant</Typography>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          p: 3,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {chatHistory.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            isUser={message.role === 'user'}
          />
        ))}
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <SmartToyIcon fontSize="small" />
            <Typography variant="body2">Typing...</Typography>
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
            size="medium"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <IconButton
            color="primary"
            onClick={handleChatSubmit}
            disabled={!chatInput.trim()}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}