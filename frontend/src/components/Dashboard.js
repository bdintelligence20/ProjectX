import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import Sidebar from './common/Sidebar';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BusinessDevelopmentResearch from './BusinessDevelopmentResearch/BusinessDevelopmentResearch';
import QATool from './QATool/QATool';
import DataAnalysis from './DataAnalysis/DataAnalysis';

// Main Card Data (default view)
const cards = [
  { title: "Business Development Research" },
  { title: "Quality Assurance" },
  { title: "Data Analysis" },
  { title: "Budget Research" }
];

export default function Dashboard() {
  const { authToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('default'); // Ensure initial state is 'default'

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authToken) {
      navigate('/login');
    }
  }, [authToken, navigate]);

  // Function to switch between different views
  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar with Clickable Navigation */}
      <Sidebar onSectionClick={handleSectionClick} />

      {/* Main Content Area */}
      <Box flex={1} padding="20px" display="flex" flexDirection="column">
        {/* Toggle between default and dynamic content */}
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
                    }}
                    onClick={() => handleSectionClick(card.title)}
                  >
                    <Typography variant="h6">{card.title}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : activeSection === 'Business Development Research' ? (
          <BusinessDevelopmentResearch />
        ) : activeSection === 'Quality Assurance' ? (
          <QATool />
        ) : activeSection === 'Data Analysis' ? (
          <DataAnalysis />
        ) : (
          <Box>Other Section Content</Box>
        )}
      </Box>

      {/* Feedback Button */}
      <IconButton
        sx={{ position: 'fixed', right: 20, bottom: 20, backgroundColor: '#6200EA', color: 'white' }}
        size="large"
      >
        <FeedbackIcon />
      </IconButton>
    </Box>
  );
}
