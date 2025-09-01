import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import AuthContext from '../../AuthContext';
import { supabase } from '../../supabaseClient';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const SourceCitation = ({ dochubSources }) => {
  if (!dochubSources?.length) return null;

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
      <Typography 
        variant="caption" 
        component="div"
        sx={{ 
          color: 'text.secondary',
          fontWeight: 600,
          mb: 1
        }}
      >
        DocHub Sources:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {dochubSources.map((source, index) => (
          <Chip
            key={index}
            label={source}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              '& .MuiChip-label': {
                fontSize: '0.75rem',
                color: '#3b82f6',
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const MessageContent = ({ message }) => {
  const { content, dochubSources } = React.useMemo(() => {
    if (message.role === 'system') {
      const parts = message.content.split(/\n(DOCHUB_SOURCES:)/);
      const mainContent = parts[0];
      let doc = [];

      if (parts[1] === 'DOCHUB_SOURCES:' && parts[2]?.trim()) {
        doc = parts[2].trim().split('\n').filter(s => s.trim());
      }

      return { content: mainContent, dochubSources: doc };
    }
    return { content: message.content };
  }, [message.content]);

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: '75%',
        backgroundColor: message.role === "user" ? '#1a2332' : '#ffffff',
        color: message.role === "user" ? 'white' : '#1a2332',
        borderRadius: message.role === "user" ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
        padding: '16px 20px',
        marginLeft: message.role === "user" ? '25%' : '0',
        marginRight: message.role === "user" ? '0' : '25%',
        border: message.role === "user" ? 'none' : '1px solid #e2e8f0',
        boxShadow: message.role === "user" 
          ? '0 2px 8px rgba(26, 35, 50, 0.15)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: message.role === "user"
            ? '0 4px 12px rgba(26, 35, 50, 0.25)'
            : '0 4px 12px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      {message.role === "user" ? (
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '1rem',
            lineHeight: 1.5,
            fontWeight: 400
          }}
        >
          {content}
        </Typography>
      ) : (
        <Box className="chat-response">
          <ReactMarkdown className="markdown-content">
            {content}
          </ReactMarkdown>
          {dochubSources?.length > 0 && (
            <SourceCitation dochubSources={dochubSources} />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default function ChatInterface({ selectedSessionId }) {
  const { user } = useContext(AuthContext);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(selectedSessionId);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Load chat history when session changes
  useEffect(() => {
    if (selectedSessionId && selectedSessionId !== currentSessionId) {
      setCurrentSessionId(selectedSessionId);
      loadChatHistory(selectedSessionId);
    } else if (!selectedSessionId) {
      // Clear chat when no session selected
      setChatHistory([]);
      setCurrentSessionId(null);
    }
  }, [selectedSessionId, currentSessionId]);

  const loadChatHistory = async (sessionId) => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const uniqueMessages = Array.from(
        new Set(data.map((msg) => msg.id))
      ).map((id) => data.find((msg) => msg.id === id));

      setChatHistory(uniqueMessages);
      
    } catch (error) {
      console.error('Error loading chat history:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load chat history',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ 
          user_id: user.id, 
          title: `Chat ${new Date().toLocaleString()}`
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('New session created:', data);
      setCurrentSessionId(data.id);
      setChatHistory([]);
      return data.id;
    } catch (error) {
      console.error('Failed to create new session:', error);
      throw error;
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || loading) return;

    try {
      setLoading(true);
      const sessionId = currentSessionId || (await createNewSession());

      // Add user message optimistically
      const userMessage = {
        role: 'user',
        content: chatInput,
        session_id: sessionId,
        id: `temp-${Date.now()}-user`,
      };

      setChatHistory((prev) => [...prev, userMessage]);

      // Save to Supabase
      const { data: savedMessage, error } = await supabase
        .from('chat_messages')
        .insert([{ 
          session_id: sessionId, 
          role: 'user', 
          content: chatInput 
        }])
        .select()
        .single();

      if (error) throw error;

      // Update temporary message with saved one
      setChatHistory((prev) => 
        prev.map((msg) => 
          msg.id === userMessage.id ? savedMessage : msg
        )
      );

      // Prepare recent chat history for context
      const recentHistory = chatHistory.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get AI response
      const response = await axios.post('/query', {
        userQuestion: chatInput,
        sessionId,
        chatHistory: recentHistory
      });

      // Add AI response
      const systemMessage = {
        role: 'system',
        content: response.data.answer,
        session_id: sessionId,
      };

      // Save AI response to Supabase
      const { data: savedSystemMessage, error: systemError } = await supabase
        .from('chat_messages')
        .insert([systemMessage])
        .select()
        .single();

      if (systemError) throw systemError;

      setChatHistory((prev) => [...prev, savedSystemMessage]);
      setChatInput('');

    } catch (error) {
      console.error('Failed to send message:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send message',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const EmptyState = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      sx={{ px: 4, textAlign: 'center' }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          color: '#1a2332',
          fontWeight: 600,
          mb: 2,
          fontSize: '2rem'
        }}
      >
        Ready to Research?
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: '#64748b',
          mb: 4,
          fontSize: '1.1rem',
          lineHeight: 1.6,
          maxWidth: '500px'
        }}
      >
        Ask me anything about companies, markets, or upload documents for analysis. 
        I'm here to help with your research needs.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 4 }}>
        {[
          "Analyze this company's financial performance",
          "Research market trends in tech industry", 
          "Summarize this quarterly report",
          "Find competitors for this business"
        ].map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            onClick={() => setChatInput(prompt)}
            sx={{
              backgroundColor: '#faf9f7',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              px: 2,
              py: 1,
              fontSize: '0.9rem',
              color: '#1a2332',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#ff6b66',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(255, 107, 102, 0.2)',
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{ backgroundColor: '#faf9f7' }}
    >
      <Box 
        flex="1 1 auto" 
        p={3} 
        overflow="auto"
        sx={{
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e0',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a0aec0',
          },
        }}
      >
        {loading && chatHistory.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress sx={{ color: '#1a2332' }} />
          </Box>
        ) : chatHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {chatHistory.map((message) => (
              <Box
                key={message.id}
                mb={3}
                display="flex"
                justifyContent={message.role === 'user' ? 'flex-end' : 'flex-start'}
                sx={{
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <MessageContent message={message} />
              </Box>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </Box>

      <Box 
        flex="0 1 auto" 
        p={3} 
        display="flex" 
        alignItems="center" 
        gap={2}
        sx={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Ask me anything about your research..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleChatSubmit();
            }
          }}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: '#faf9f7',
              fontSize: '1rem',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: '#ff6b66',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff6b66',
                borderWidth: '2px',
              },
            },
            '& .MuiInputBase-input': {
              padding: '16px 20px',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleChatSubmit}
          disabled={loading || !chatInput.trim()}
          sx={{ 
            borderRadius: '20px',
            minWidth: '120px',
            height: '56px',
            backgroundColor: '#1a2332',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#2d3748',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              backgroundColor: '#94a3b8',
            },
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(26, 35, 50, 0.15)',
          }}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        >
          {loading ? 'Thinking...' : 'Send'}
        </Button>
      </Box>

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
