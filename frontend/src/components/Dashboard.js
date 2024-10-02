import React, { useState } from 'react';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';  // Correct Grid2 import
import Sidebar from './common/Sidebar';  // Import the reusable Sidebar component
import FeedbackIcon from '@mui/icons-material/Feedback';
import BusinessDevelopmentResearch from './BusinessDevelopmentResearch/BusinessDevelopmentResearch';  // Import the Business Development Research component
import QATool from './QATool/QATool';  // Import the QA Tool component
import DataAnalysis from './DataAnalysis/DataAnalysis';  // Import the Data Analysis component

// Main Card Data (default view)
const cards = [
  { title: "Business Development Research" },
  { title: "Quality Assurance" },
  { title: "Data Analysis" },
  { title: "Budget Research" }
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('default'); // Ensure initial state is 'default'

  // Function to switch between different views
  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  return (
    <Box display="flex" height="100vh">  {/* Ensuring the full height is used */}
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
              <Avatar alt="Nicholas Flemmer" src="/static/images/avatar/1.jpg" />
            </Box>

            {/* Default Card Layout */}
            <Grid container rowSpacing={3} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {cards.map((card, index) => (
                <Grid item xs={6} key={index}> {/* 2 columns on all screen sizes */}
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
        ) : activeSection === 'Data Analysis' ? (  // Add Data Analysis section here
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
