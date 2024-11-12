import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import { Box, Typography, Avatar, IconButton, CircularProgress, Grid } from '@mui/material';
import Sidebar from './common/Sidebar';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BusinessDevelopmentResearch from './BusinessDevelopmentResearch/BusinessDevelopmentResearch';
import QATool from './QATool/QATool';
import DataAnalysis from './DataAnalysis/DataAnalysis';

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('default');
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Redirect to login if user is not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleChatSessionClick = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  // Display loading spinner while checking authentication state
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
    { title: "Data Analysis" },
    { title: "Budget Research" }
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
      <Box flex={1} padding="20px" display="flex" flexDirection="column">
        {activeSection === 'default' ? (
          <Box>
            {/* Top Bar */}
            <Box display="flex" justifyContent="space-between" marginBottom="20px">
              <Typography variant="h5">How can I help you today?</Typography>
              <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
            </Box>

            {/* Default Card Layout */}
            <Grid container rowSpacing={3} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {cards.map((card, index) => (
                <Grid item xs={6} key={index}>
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
          <BusinessDevelopmentResearch 
            currentSessionId={currentSessionId}
          />
        ) : activeSection === 'Quality Assurance' ? (
          <QATool 
            currentSessionId={currentSessionId}
          />
        ) : activeSection === 'Data Analysis' ? (
          <DataAnalysis 
            currentSessionId={currentSessionId}
          />
        ) : activeSection === 'Budget Research' ? (
          <Box>Budget Research Content</Box>
        ) : (
          <Box>Other Section Content</Box>
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