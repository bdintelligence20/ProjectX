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
import AuthContext from '../../AuthContext';
import { supabase } from '../../supabaseClient';

// Styled Components
const SidebarContainer = styled(Box)(() => ({
  backgroundColor: '#f5f5f5',
  padding: '20px',
  height: '100vh',
  width: '300px',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'hidden',
}));

const Logo = styled('img')({
  width: '150px',
  marginBottom: '20px',
});

const SearchField = styled(TextField)(() => ({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ddd',
    },
    '&:hover fieldset': {
      borderColor: '#007bff',
    },
  },
}));

const SearchHistoryContainer = styled(Box)(() => ({
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '16px',
  overflowY: 'auto',
  marginTop: '20px',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '3px',
  },
}));

function Sidebar({ onSectionClick, onChatSessionClick, currentSessionId }) {
  const { user } = useContext(AuthContext);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadChatSessions();
  
      const subscription = supabase
        .channel('chat_sessions_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chat_sessions', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Real-time session change:', payload);
  
            setChatSessions((prevSessions) => {
              const existingIds = new Set(prevSessions.map((session) => session.id));
  
              if (payload.eventType === 'INSERT' && !existingIds.has(payload.new.id)) {
                return [payload.new, ...prevSessions];
              }
              if (payload.eventType === 'UPDATE') {
                return prevSessions.map((session) =>
                  session.id === payload.new.id ? payload.new : session
                );
              }
              if (payload.eventType === 'DELETE') {
                return prevSessions.filter((session) => session.id !== payload.old.id);
              }
              return prevSessions;
            });
          }
        )
        .subscribe();
  
      return () => subscription.unsubscribe();
    }
  }, [user]);
  

  const loadChatSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          chat_messages (
            id,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const sortedSessions = data.sort((a, b) => {
        const aLastMessage = a.chat_messages.length > 0
          ? Math.max(...a.chat_messages.map((m) => new Date(m.created_at)))
          : new Date(a.created_at);
        const bLastMessage = b.chat_messages.length > 0
          ? Math.max(...b.chat_messages.map((m) => new Date(m.created_at)))
          : new Date(b.created_at);
        return bLastMessage - aLastMessage;
      });

      console.log('Loaded chat sessions:', sortedSessions);
      setChatSessions(sortedSessions);
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
        .insert([{ user_id: user.id, title: `New Chat ${new Date().toLocaleString()}` }])
        .select()
        .single();

      if (error) throw error;

      console.log('New session created:', data);
      setChatSessions((prev) => [data, ...prev]);
      onChatSessionClick(data.id);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSessionClick = (session) => {
    if (currentSessionId !== session.id) {
      console.log('Switching to session:', session.id);
      onChatSessionClick(session.id);
    }
  };

  const filteredSessions = chatSessions.filter((session) =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarContainer>
      <Logo src="/images/lrmg-logo.png" alt="LRMG Logo" />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleNewChat}
        sx={{
          mb: 2,
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        New Chat
      </Button>
      <SearchField
        variant="outlined"
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <SearchHistoryContainer>
        <Typography variant="h6" gutterBottom>
          Chat History
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List>
            {filteredSessions.map((session) => (
              <ListItem
                key={session.id}
                button
                selected={currentSessionId === session.id}
                onClick={() => handleSessionClick(session)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 123, 255, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 123, 255, 0.12)',
                    },
                  },
                }}
              >
                <ListItemText
                  primary={session.title}
                  secondary={session.updated_at}
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
