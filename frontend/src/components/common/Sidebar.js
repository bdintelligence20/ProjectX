import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon,
  ListItemText,
  Paper,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import HistoryIcon from '@mui/icons-material/History';

export default function Sidebar({ onSectionClick }) {
  const navigationItems = [
    {
      title: 'Business Development Research',
      icon: <BusinessIcon />,
      onClick: () => onSectionClick('Business Development Research')
    },
    {
      title: 'Quality Assurance',
      icon: <VerifiedUserIcon />,
      onClick: () => onSectionClick('Quality Assurance')
    },
    {
      title: 'Data Analysis',
      icon: <DataUsageIcon />,
      onClick: () => onSectionClick('Data Analysis')
    }
  ];

  const searchHistory = ['MTN | 17-09-2024', 'MTN | 17-09-2024'];

  return (
    <Box
      sx={{
        width: 300,
        height: '100vh',
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/path/to/lrmg-logo.png" 
          alt="LRMG Logo" 
          style={{ width: 150, height: 'auto' }}
        />
      </Box>

      {/* Search Section */}
      <Box sx={{ px: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search History..."
          size="small"
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            sx: {
              borderRadius: 2,
              backgroundColor: 'background.default'
            }
          }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Navigation Section */}
      <List sx={{ px: 2 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.title}
            button
            onClick={item.onClick}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Search History Section */}
      <Paper
        elevation={0}
        sx={{
          m: 2,
          p: 2,
          backgroundColor: 'background.default',
          borderRadius: 2
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            mb: 2
          }}
        >
          <HistoryIcon sx={{ mr: 1, fontSize: 20 }} />
          Search History
        </Typography>
        <List dense>
          {searchHistory.map((item, index) => (
            <ListItem
              key={index}
              button
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <ListItemText
                primary={item}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  color: 'text.secondary'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}