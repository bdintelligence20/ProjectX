import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Button, 
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import AuthContext from '../../AuthContext';
import { supabase } from '../../supabaseClient';
import axios from 'axios';

export default function ChatInterface({ selectedSessionId = null }) {
  const { user } = useContext(AuthContext);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Initialize or load session
  useEffect(() => {
    if (user) {
      if (selectedSessionId) {
        loadChatHistory(selectedSessionId);
      } else {
        initializeNewSession();
      }
    }
  }, [user, selectedSessionId]);

  const initializeNewSession = async () => {
    try {
      const title = `Chat ${new Date().toLocaleString()}`;
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{ 
          user_id: user.id,
          title
        }])
        .select('id')
        .single();

      if (sessionError) throw sessionError;
      
      setCurrentSessionId(sessionData.id);
      setChatHistory([]);
      
      setSnackbar({
        open: true,
        message: 'New chat session started',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating new session:', error);
      setError('Failed to create new chat session');
      setSnackbar({
        open: true,
        message: 'Failed to create new chat session',
        severity: 'error'
      });
    }
  };

  const loadChatHistory = async (sessionId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setChatHistory(data);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
      setSnackbar({
        open: true,
        message: 'Failed to load chat history',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !currentSessionId || loading) return;

    try {
      setLoading(true);
      
      // Add user message to UI immediately
      const userMessage = { role: "user", content: chatInput };
      setChatHistory(prev => [...prev, userMessage]);

      // Send query to backend
      const response = await axios.post('/query', {
        userQuestion: chatInput,
        sessionId: currentSessionId,
        searchScope: "whole"
      });

      // Add system response to UI
      const systemMessage = { role: "system", content: response.data.answer };
      setChatHistory(prev => [...prev, systemMessage]);

      setChatInput('');
    } catch (error) {
      console.error('Error in chat submission:', error);
      const errorMessage = { 
        role: "system", 
        content: "Error occurred while processing your request. Please try again." 
      };
      setChatHistory(prev => [...prev, errorMessage]);
      
      setSnackbar({
        open: true,
        message: 'Failed to process your request',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleChatSubmit();
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
      {/* Chat Messages Area */}
      <Box 
        flex="1 1 auto" 
        p={2} 
        overflow="auto"
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
        }}
      >
        {loading && chatHistory.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {chatHistory.map((message, index) => (
              <Box 
                key={index} 
                mb={2}
                display="flex"
                justifyContent={message.role === "user" ? "flex-end" : "flex-start"}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    backgroundColor: message.role === "user" ? '#007AFF' : '#f0f0f0',
                    color: message.role === "user" ? 'white' : 'black',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginLeft: message.role === "user" ? '30%' : '0',
                    marginRight: message.role === "user" ? '0' : '30%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="body1">
                    {message.content}
                  </Typography>
                </Box>
              </Box>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </Box>

      {/* Input Area */}
      <Box 
        flex="0 1 auto" 
        p={2} 
        display="flex" 
        alignItems="center" 
        borderTop="1px solid #ddd"
        backgroundColor="#ffffff"
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Type your message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleChatSubmit}
          disabled={loading || !chatInput.trim()}
          sx={{ 
            ml: 1,
            borderRadius: '12px',
            minWidth: '100px',
            height: '56px'
          }}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        >
          Send
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}