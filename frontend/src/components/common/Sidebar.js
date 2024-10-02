// Sidebar.js
import React from 'react';
import { Box, Typography, TextField, IconButton, List, ListItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/system';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DataUsageIcon from '@mui/icons-material/DataUsage';

// Styled Components for Sidebar layout
const SidebarContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f5f5f5',  // Matches background color from design
  padding: '20px',
  height: '100vh',
  width: '300px',
}));

const Logo = styled('img')({
  width: '150px',
  marginBottom: '20px',
});

const SearchField = styled(TextField)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '25px',
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

const Navigation = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '30px',
  '& .MuiTypography-root': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    cursor: 'pointer',
    color: '#007bff',
    fontWeight: '500',
  },
}));

const StyledIcon = styled(Box)(({ theme }) => ({
  marginRight: '10px',
}));

const SearchHistoryContainer = styled(Box)(({ theme }) => ({
  marginTop: '30px',
  padding: '10px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  height: '200px',
  overflowY: 'auto',
}));

// In Sidebar.js
export default function Sidebar({ onSectionClick }) {
    return (
      <SidebarContainer>
        {/* Logo */}
        <Logo src="/path/to/lrmg-logo.png" alt="LRMG Logo" />
        
        {/* Search Bar */}
        <SearchField
          variant="outlined"
          placeholder="Search History..."
          InputProps={{
            endAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
          }}
          fullWidth
        />
        
        {/* Navigation Links */}
        <Navigation>
          <Typography variant="subtitle1" onClick={() => onSectionClick('Business Development Research')}>
            <StyledIcon><BusinessIcon /></StyledIcon>
            Business Development Research
          </Typography>
          <Typography variant="subtitle1" onClick={() => onSectionClick('Quality Assurance')}>
            <StyledIcon><VerifiedUserIcon /></StyledIcon>
            Quality Assurance
          </Typography>
          <Typography variant="subtitle1" onClick={() => onSectionClick('Data Analysis')}>
            <StyledIcon><DataUsageIcon /></StyledIcon>
            Data Analysis
          </Typography>
        </Navigation>
  
        {/* Search History */}
        <SearchHistoryContainer>
          <Typography variant="h6">Search History</Typography>
          <List>
            {['MTN | 17-09-2024', 'MTN | 17-09-2024'].map((item, index) => (
              <ListItem key={index} button>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </SearchHistoryContainer>
      </SidebarContainer>
    );
  }
  