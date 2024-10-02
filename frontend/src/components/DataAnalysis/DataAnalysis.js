import React from 'react';
import { Box } from '@mui/material';
import ChatInterface from '../common/ChatInterface';  // Reusing the same Chat Interface
import DataAnalysisRightColumn from './DataAnalysisRightColumn';  // New Right Column for Data Analysis

export default function DataAnalysis() {
  return (
    <Box display="flex" height="100vh">
      {/* Middle Section - Chat Interface */}
      <ChatInterface />

      {/* Right Column - Sources and Data Analysis Summary */}
      <DataAnalysisRightColumn />
    </Box>
  );
}
