import React from 'react';
import { Box } from '@mui/material';
import ChatInterface from '../common/ChatInterface';
import RightColumn from '../common/RightColumn';

export default function BusinessDevelopmentResearch({ currentSessionId }) {
  return (
    <Box display="flex" height="100vh">
      {/* Middle Section - Chat Interface */}
      <ChatInterface 
        selectedSessionId={currentSessionId}
      />

      {/* Right Column - Add and View Source Library */}
      <RightColumn onSourceAdded={() => {}} />
    </Box>
  );
}