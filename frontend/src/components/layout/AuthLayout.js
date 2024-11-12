import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const GradientBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  background: 'linear-gradient(-45deg, #6366f1, #a855f7, #ec4899, #3b82f6)',
  backgroundSize: '400% 400%',
  animation: 'gradient 15s ease infinite',
  '@keyframes gradient': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1024px',
  display: 'flex',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: theme.shadows[20],
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
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
  title: "Get Everything You Want",
  subtitle: "You can get everything you want if you work hard, trust the process, and stick to the plan."
} }) {
  const theme = useTheme();

  return (
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
              background: 'linear-gradient(-45deg, #6366f1, #a855f7, #ec4899, #3b82f6)',
              backgroundSize: '400% 400%',
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
              A Wise Quote
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
              {quote.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {quote.subtitle}
            </Typography>
          </Box>
        </QuoteSection>
        <FormSection>
          {children}
        </FormSection>
      </AuthCard>
    </GradientBox>
  );
}