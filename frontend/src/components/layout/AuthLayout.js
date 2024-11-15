import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const GradientBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  background: 'linear-gradient(-45deg, #2fbdc1, #0c2f68)',
  backgroundSize: '200% 200%',
  animation: 'gradient 15s ease infinite',
  '@keyframes gradient': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  position: 'fixed', // Fix the position
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'auto', // Allow scrolling if content is too large
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1024px',
  margin: 'auto', // Center the card
  display: 'flex',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: theme.shadows[20],
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    margin: theme.spacing(2), // Add some margin on smaller screens
  },
}));

const QuoteSection = styled(Box)(({ theme }) => ({
  width: '50%',
  backgroundColor: '#000',
  padding: theme.spacing(6),
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  width: '50%',
  padding: theme.spacing(6),
  backgroundColor: '#fff',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

export default function AuthLayout({ children, quote = {
  title: "Greatness is not a function of circumstance. Greatness, it turns out, is largely a matter of conscious choice, and discipline.",
  subtitle: "Jim Collins"
} }) {
  const theme = useTheme();

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden', // Prevent outer scrolling
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <GradientBox>
        <AuthCard>
          <QuoteSection>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.5,
                background: 'linear-gradient(-45deg, #2fbdc1, #0c2f68)',
                backgroundSize: '200% 200%',
                animation: 'gradient 15s ease infinite',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: '0.1em',
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 1,
                  display: 'block',
                }}
              >
                Words of Wisdom
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                  lineHeight: 1.3,
                }}
              >
                {quote.title}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  '&::before': {
                    content: '"— "',
                    opacity: 0.7,
                  }
                }}
              >
                {quote.subtitle}
              </Typography>
            </Box>
          </QuoteSection>
          <FormSection>
            {children}
          </FormSection>
        </AuthCard>
      </GradientBox>
    </Box>
  );
}