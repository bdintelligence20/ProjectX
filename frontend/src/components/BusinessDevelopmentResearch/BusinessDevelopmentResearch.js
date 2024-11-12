import React, { useState } from 'react';
import { Box } from '@mui/material';
import ChatInterface from '../common/ChatInterface';
import RightColumn from '../common/RightColumn';
import Sidebar from '../common/Sidebar';

export default function BusinessDevelopmentResearch() {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [activeSection, setActiveSection] = useState('Business Development Research');

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleChatSessionClick = (sessionId) => {
    console.log('Selected session:', sessionId); // Debug log
    setCurrentSessionId(sessionId);
  };

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <Sidebar 
        onSectionClick={handleSectionClick}
        onChatSessionClick={handleChatSessionClick}
        currentSessionId={currentSessionId}
      />

      {/* Middle Section - Chat Interface */}
      <ChatInterface 
        selectedSessionId={currentSessionId}
      />

      {/* Right Column */}
      <RightColumn onSourceAdded={() => {}} />
    </Box>
  );
}