import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Divider,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AuthContext from '../../AuthContext';
import { supabase } from '../../supabaseClient';

// Styled Components
const SidebarContainer = styled(Box)(() => ({
  backgroundColor: '#ffffff',
  padding: '24px',
  height: '100vh',
  width: '320px',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'hidden',
  borderRight: '1px solid #e2e8f0',
  boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
}));

const Logo = styled('img')({
  width: '160px',
  marginBottom: '32px',
  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
});

const SearchField = styled(TextField)(() => ({
  backgroundColor: '#faf9f7',
  borderRadius: '16px',
  marginBottom: '24px',
  '& .MuiOutlinedInput-root': {
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
  '& .MuiInputAdornment-root': {
    color: '#64748b',
  },
}));

const SearchHistoryContainer = styled(Box)(() => ({
  flex: 1,
  backgroundColor: 'transparent',
  borderRadius: '16px',
  padding: '0',
  overflowY: 'auto',
  marginTop: '16px',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#cbd5e0',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#a0aec0',
  },
}));

function Sidebar({ onChatSessionClick, currentSessionId, onProspectingClick, currentView }) {
  const { user } = useContext(AuthContext);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  const loadChatSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const uniqueSessions = Array.from(new Set(data.map((session) => session.id)))
        .map((id) => data.find((session) => session.id === id));

      setChatSessions(uniqueSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ 
          user_id: user.id, 
          title: `Research Chat ${new Date().toLocaleDateString()}`
        }])
        .select()
        .single();

      if (error) throw error;

      setChatSessions((prev) => [data, ...prev]);
      onChatSessionClick(data.id);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSessionClick = (session) => {
    if (currentSessionId !== session.id) {
      onChatSessionClick(session.id);
    }
  };

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const filteredSessions = chatSessions.filter((session) =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarContainer>
      <Logo src="/images/lrmg-logo.png" alt="LRMG Logo" />
      
      <Button
        variant="contained"
        startIcon={<PersonSearchIcon />}
        onClick={onProspectingClick}
        fullWidth
        sx={{
          mb: 2,
          borderRadius: '16px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          height: '48px',
          backgroundColor: currentView === 'prospecting' ? '#ff6b66' : '#2563eb',
          '&:hover': {
            backgroundColor: currentView === 'prospecting' ? '#ff5a5a' : '#1d4ed8',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
        }}
      >
        Prospecting
      </Button>
      
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleNewChat}
        fullWidth
        sx={{
          mb: 3,
          borderRadius: '16px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          height: '48px',
          backgroundColor: '#1a2332',
          '&:hover': {
            backgroundColor: '#2d3748',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(26, 35, 50, 0.15)',
        }}
      >
        New Research Chat
      </Button>

      <SearchField
        variant="outlined"
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <SearchHistoryContainer>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: '#64748b',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Recent Conversations
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress size={24} sx={{ color: '#1a2332' }} />
          </Box>
        ) : filteredSessions.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            sx={{ 
              mt: 6, 
              color: '#94a3b8',
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              No conversations yet
            </Typography>
            <Typography variant="caption">
              Start a new chat to begin researching
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredSessions.map((session) => (
              <ListItem
                key={session.id}
                button
                onClick={() => handleSessionClick(session)}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  p: 2,
                  backgroundColor: currentSessionId === session.id 
                    ? 'rgba(255, 107, 102, 0.08)'
                    : 'transparent',
                  border: currentSessionId === session.id
                    ? '1px solid rgba(255, 107, 102, 0.2)'
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: currentSessionId === session.id
                      ? 'rgba(255, 107, 102, 0.12)'
                      : 'rgba(0, 0, 0, 0.02)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
                  },
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <ListItemText
                  primary={session.title}
                  secondary={formatSessionDate(session.updated_at)}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: currentSessionId === session.id ? 600 : 500,
                      fontSize: '0.95rem',
                      color: '#1a2332',
                      lineHeight: 1.3,
                    }
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      fontSize: '0.8rem',
                      color: '#64748b',
                      mt: 0.5,
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </SearchHistoryContainer>
    </SidebarContainer>
  );
}

export default Sidebar;
