import React from 'react';
import { Box } from '@mui/material';
import ChatInterface from '../common/ChatInterface';
import RightColumn from '../common/RightColumn';

export default function BusinessDevelopmentResearch() {
  return (
    <Box display="flex" height="100vh">
      {/* Right Column - Add and View Source Library */}
      <RightColumn onSourceAdded={() => {}} />

      {/* Middle Section - Chat Interface */}
      <ChatInterface />
    </Box>
  );
}
