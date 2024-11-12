import React from 'react';
import { Box } from '@mui/material';
import ChatInterface from '../common/ChatInterface';
import RightColumn from '../common/RightColumn';

export default function BusinessDevelopmentResearch() {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: 'background.default',
        gap: 2
      }}
    >
      {/* Chat Interface */}
      <ChatInterface />

      {/* Right Column */}
      <RightColumn onSourceAdded={() => {}} />
    </Box>
  );
}