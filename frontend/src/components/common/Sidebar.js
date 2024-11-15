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
import DataUsageIcon from '@mui/icons-material/DataUsage';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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

const Navigation = styled(Box)(() => ({
  marginBottom: '20px',
  '& .MuiTypography-root': {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 123, 255, 0.08)',
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
      
      // Set up real-time subscription for chat sessions
      const subscription = supabase
        .channel('chat_sessions_changes')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_sessions',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('New session created:', payload);
            loadChatSessions();
          }
        )
        .on('postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'chat_sessions',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Session deleted:', payload);
            loadChatSessions();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
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

      // Sort sessions by most recent message or creation date
      const sortedSessions = data.sort((a, b) => {
        const aLastMessage = a.chat_messages.length > 0 
          ? Math.max(...a.chat_messages.map(m => new Date(m.created_at)))
          : new Date(a.created_at);
        const bLastMessage = b.chat_messages.length > 0 
          ? Math.max(...b.chat_messages.map(m => new Date(m.created_at)))
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
        .insert([
          { 
            user_id: user.id,
            title: `New Chat ${new Date().toLocaleString()}`
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        console.log('Created new chat session:', data);
        onChatSessionClick(data.id);
        loadChatSessions();
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleEditSession = async () => {
    if (!selectedSession || !editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: editTitle })
        .eq('id', selectedSession.id);

      if (error) throw error;
      setEditDialogOpen(false);
      setAnchorEl(null);
      loadChatSessions();
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', selectedSession.id);

      if (error) throw error;
      setDeleteDialogOpen(false);
      setAnchorEl(null);
      
      // If the current session was deleted, clear it
      if (currentSessionId === selectedSession.id) {
        onChatSessionClick(null);
      }
      
      loadChatSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleSessionClick = (session) => {
    console.log('Session clicked:', session.id);
    onChatSessionClick(session.id);
  };

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // If the date is today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    // If the date is yesterday
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // If the date is this year
    else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    // If the date is from a previous year
    else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <SidebarContainer>
      {/* Logo */}
      <Logo src="/images/lrmg-logo.png" alt="LRMG Logo" />
      
      {/* New Chat Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleNewChat}
        sx={{
          mb: 2,
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        New Chat
      </Button>

      {/* Search Field */}
      <SearchField
        variant="outlined"
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
      />
      
      {/* Navigation */}
      <Navigation>
        <Typography
          variant="subtitle1"
          onClick={() => onSectionClick('Business Development Research')}
          sx={{
            color: 'text.primary',
            fontWeight: 500,
          }}
        >
          <BusinessIcon sx={{ mr: 1 }} />
          Business Development Research
        </Typography>
        <Typography
          variant="subtitle1"
          onClick={() => onSectionClick('Quality Assurance')}
          sx={{
            color: 'text.primary',
            fontWeight: 500,
          }}
        >
          <VerifiedUserIcon sx={{ mr: 1 }} />
          Quality Assurance
        </Typography>
        <Typography
          variant="subtitle1"
          onClick={() => onSectionClick('Data Analysis')}
          sx={{
            color: 'text.primary',
            fontWeight: 500,
          }}
        >
          <DataUsageIcon sx={{ mr: 1 }} />
          Data Analysis
        </Typography>
      </Navigation>

      <Divider sx={{ my: 2 }} />

      {/* Chat History */}
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
                  secondary={formatDate(session.updated_at)}
                  primaryTypographyProps={{
                    noWrap: true,
                    style: { 
                      fontWeight: currentSessionId === session.id ? 600 : 400 
                    }
                  }}
                  secondaryTypographyProps={{
                    noWrap: true,
                    style: { fontSize: '0.75rem' }
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      setAnchorEl(event.currentTarget);
                      setSelectedSession(session);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </SearchHistoryContainer>

      {/* Session Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setEditTitle(selectedSession?.title || '');
            setEditDialogOpen(true);
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setDeleteDialogOpen(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Rename Chat Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSession} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Chat Session</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this chat session? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteSession}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </SidebarContainer>
  );
}

export default Sidebar;