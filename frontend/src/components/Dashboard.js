import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import { Box, Typography, Avatar, IconButton, CircularProgress, Grid } from '@mui/material';
import Sidebar from './common/Sidebar';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BusinessDevelopmentResearch from './BusinessDevelopmentResearch/BusinessDevelopmentResearch';
import QATool from './QATool/QATool';
import DataAnalysis from './DataAnalysis/DataAnalysis';
import debounce from 'lodash/debounce';

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('default');
  const [currentSessionId, setCurrentSessionId] = useState(null);

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSectionClick = (section) => {
    console.log('Section clicked:', section);
    setActiveSection(section);
  };

  // Debounced function for handling session clicks
  const handleChatSessionClick = useCallback(
    debounce((sessionId) => {
      console.log('Chat session clicked:', sessionId);
      setCurrentSessionId(sessionId);
      // If not already in a section, go to Business Development Research
      if (activeSection === 'default') {
        setActiveSection('Business Development Research');
      }
    }, 300), // Adjust debounce timing as needed
    [activeSection]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    { title: "Business Development Research" },
    { title: "Quality Assurance" },
  ];

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar with Clickable Navigation */}
      <Sidebar 
        onSectionClick={handleSectionClick}
        onChatSessionClick={handleChatSessionClick}
        currentSessionId={currentSessionId}
      />

      {/* Main Content Area */}
      <Box flex={1} display="flex" flexDirection="column">
        {activeSection === 'default' ? (
          <Box p={3}>
            {/* Top Bar */}
            <Box display="flex" justifyContent="space-between" marginBottom="20px">
              <Typography variant="h5">How can I help you today?</Typography>
              <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
            </Box>

            {/* Default Card Layout */}
            <Grid container spacing={3}>
              {cards.map((card, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box
                    sx={{
                      background: 'linear-gradient(45deg, #FF0000, #FF6F00)',
                      color: 'white',
                      borderRadius: '16px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                    onClick={() => setActiveSection(card.title)}
                  >
                    <Typography variant="h6">{card.title}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : activeSection === 'Business Development Research' ? (
          <BusinessDevelopmentResearch currentSessionId={currentSessionId} />
        ) : activeSection === 'Quality Assurance' ? (
          <QATool currentSessionId={currentSessionId} />
        ) : activeSection === 'Data Analysis' ? (
          <DataAnalysis currentSessionId={currentSessionId} />
        ) : (
          <Box p={3}>Other Section Content</Box>
        )}
      </Box>

      {/* Feedback Button */}
      <IconButton
        sx={{ 
          position: 'fixed', 
          right: 20, 
          bottom: 20, 
          backgroundColor: '#6200EA', 
          color: 'white',
          '&:hover': {
            backgroundColor: '#7C4DFF',
          },
          boxShadow: '0 3px 5px 2px rgba(98, 0, 234, .3)'
        }}
        size="large"
      >
        <FeedbackIcon />
      </IconButton>
    </Box>
  );
}
