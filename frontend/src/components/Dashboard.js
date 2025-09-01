import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import { Box, Typography, Avatar, IconButton, CircularProgress, Grid } from '@mui/material';
import Sidebar from './common/Sidebar';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BusinessDevelopmentResearch from './BusinessDevelopmentResearch/BusinessDevelopmentResearch';
import ProspectingTool from './Prospecting/ProspectingTool';
import QATool from './QATool/QATool';
import DataAnalysis from './DataAnalysis/DataAnalysis';
import debounce from 'lodash/debounce';

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentView, setCurrentView] = useState('research'); // 'research' or 'prospecting'

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Handle chat session selection from sidebar
  const handleChatSessionClick = (sessionId) => {
    if (currentSessionId !== sessionId) {
      console.log('Chat session clicked (Dashboard):', sessionId);
      setCurrentSessionId(sessionId);
      setCurrentView('research');
    }
  };

  // Handle prospecting view
  const handleProspectingClick = () => {
    setCurrentView('prospecting');
    setCurrentSessionId(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" sx={{ backgroundColor: '#faf9f7' }}>
        <CircularProgress sx={{ color: '#1a2332' }} />
      </Box>
    );
  }

  return (
    <Box display="flex" height="100vh" sx={{ backgroundColor: '#faf9f7' }}>
      {/* Enhanced Sidebar */}
      <Sidebar 
        onChatSessionClick={handleChatSessionClick}
        currentSessionId={currentSessionId}
        onProspectingClick={handleProspectingClick}
        currentView={currentView}
      />

      {/* Main Chat Interface */}
      <Box flex={1} display="flex" flexDirection="column">
        {/* Header Bar */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          p={3}
          sx={{ 
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#1a2332',
              fontWeight: 600,
              fontSize: '1.5rem'
            }}
          >
            {currentView === 'prospecting' ? 'Sales Prospecting' : 'Research Assistant'}
          </Typography>
          <Avatar 
            alt={user?.email || "User"} 
            sx={{ 
              backgroundColor: '#ff6b66',
              color: 'white',
              width: 40,
              height: 40
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        </Box>

        {/* Main Content Interface */}
        {currentView === 'prospecting' ? (
          <ProspectingTool />
        ) : (
          <BusinessDevelopmentResearch currentSessionId={currentSessionId} />
        )}
      </Box>

      {/* Floating Feedback Button */}
      <IconButton
        sx={{ 
          position: 'fixed', 
          right: 24, 
          bottom: 24, 
          backgroundColor: '#1a2332', 
          color: 'white',
          width: 56,
          height: 56,
          '&:hover': {
            backgroundColor: '#2d3748',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(26, 35, 50, 0.3)',
          zIndex: 1000
        }}
        size="large"
      >
        <FeedbackIcon />
      </IconButton>
    </Box>
  );
}
