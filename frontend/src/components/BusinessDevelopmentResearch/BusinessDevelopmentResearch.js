import React from 'react';
import { Box } from '@mui/material';
import ChatInterface from '../common/ChatInterface';
import RightColumn from '../common/RightColumn';

export default function BusinessDevelopmentResearch() {
  return (
    <Box display="flex" height="100vh">
      {/* Middle Section - Chat Interface */}
      <ChatInterface />

      {/* Right Column - Sources and Company Summary */}
      <RightColumn />
    </Box>
  );
}
