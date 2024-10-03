import React, { useState } from 'react';
import { Box } from '@mui/material';
import ChatInterface from '../common/ChatInterface';
import RightColumn from '../common/RightColumn';

export default function BusinessDevelopmentResearch() {
  const [sources, setSources] = useState([]); // State to manage sources

  // Handler to add sources passed to RightColumn and ChatInterface
  const handleSourceAdded = (newSource) => {
    setSources((prevSources) => [...prevSources, newSource]);
  };

  return (
    <Box display="flex" height="100vh">
      {/* Middle Section - Chat Interface */}
      <ChatInterface sources={sources} />

      {/* Right Column - Sources and Company Summary */}
      <RightColumn sources={sources} onSourceAdded={handleSourceAdded} />
    </Box>
  );
}
