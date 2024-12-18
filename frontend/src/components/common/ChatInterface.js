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
        maxWidth: '70%',
        backgroundColor: message.role === "user" ? '#007AFF' : '#f8fafc',
        color: message.role === "user" ? 'white' : 'inherit',
        borderRadius: '12px',
        padding: '12px 16px',
        marginLeft: message.role === "user" ? '30%' : '0',
        marginRight: message.role === "user" ? '0' : '30%',
        border: message.role === "user" ? 'none' : '1px solid #e2e8f0',
      }}
    >
      {message.role === "user" ? (
        <Typography variant="body1">
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
    console.log('Session ID changed:', selectedSessionId, 'Current:', currentSessionId);
    if (selectedSessionId && selectedSessionId !== currentSessionId) {
      setCurrentSessionId(selectedSessionId);
      loadChatHistory(selectedSessionId);
    }
  }, [selectedSessionId]);

  const loadChatHistory = async (sessionId) => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      console.log('Loading chat history for session:', sessionId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const uniqueMessages = Array.from(
        new Set(data.map((msg) => msg.id))
      ).map((id) => data.find((msg) => msg.id === id));

      console.log(`Loaded ${uniqueMessages.length} messages for session:`, sessionId);
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

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      height="100vh"
      backgroundColor="#fafafa"
    >
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
            {chatHistory.map((message) => (
              <Box
                key={message.id}
                mb={2}
                display="flex"
                justifyContent={message.role === 'user' ? 'flex-end' : 'flex-start'}
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
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleChatSubmit();
            }
          }}
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