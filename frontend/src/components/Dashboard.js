import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Container,
  Grid2, // Import as MuiGrid to be explicit
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import Sidebar from './common/Sidebar';
import BusinessDevelopmentResearch from './BusinessDevelopmentResearch/BusinessDevelopmentResearch';
import QATool from './QATool/QATool';
import DataAnalysis from './DataAnalysis/DataAnalysis';
import AuthContext from '../AuthContext';

const cards = [
  { 
    title: "Business Development Research",
    gradient: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
  },
  { 
    title: "Quality Assurance",
    gradient: 'linear-gradient(45deg, #4158D0, #C850C0)',
  },
  { 
    title: "Data Analysis",
    gradient: 'linear-gradient(45deg, #0093E9, #80D0C7)',
  },
  { 
    title: "Budget Research",
    gradient: 'linear-gradient(45deg, #8EC5FC, #E0C3FC)',
  },
];

export default function Dashboard() {
  const theme = useTheme();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('default');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'Business Development Research':
        return <BusinessDevelopmentResearch />;
      case 'Quality Assurance':
        return <QATool />;
      case 'Data Analysis':
        return <DataAnalysis />;
      default:
        return (
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                How can I help you today?
              </Typography>
              <Avatar
                alt={user?.email || 'User'}
                src="/static/images/avatar/1.jpg"
                sx={{
                  width: 40,
                  height: 40,
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              />
            </Box>

            <Grid2 container spacing={3}>
              {cards.map((card, index) => (
                <Grid2 item xs={12} sm={6} key={index}>
                  <Card
                    onClick={() => setActiveSection(card.title)}
                    sx={{
                      height: 200,
                      cursor: 'pointer',
                      background: card.gradient,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px !important', // Override default padding
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h2"
                        color="white"
                        fontWeight="bold"
                        align="center"
                        sx={{ 
                          textShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                        }}
                      >
                        {card.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          </Container>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Sidebar */}
      <Sidebar onSectionClick={setActiveSection} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {renderContent()}

        {/* Feedback Button */}
        <IconButton
          sx={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            boxShadow: theme.shadows[4],
          }}
          size="large"
        >
          <FeedbackIcon />
        </IconButton>
      </Box>
    </Box>
  );
}