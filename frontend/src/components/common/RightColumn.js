import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  List,
  ListItem,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowForwardIos as ArrowIcon,
} from '@mui/icons-material';
import CustomModal from '../modals/CustomModal';
import AddSourcesModal from '../modals/AddSourcesModal';
import SourceLibraryModal from '../modals/SourceLibraryModal';
import CategorySummaries from '../summaries/CategorySummaries';  // Import the separate component

const navigationLinks = [
  { 
    title: 'Business Research Summaries', 
    emoji: '📊',
    category: 'Business_Research'
  },
  { 
    title: 'Competitor Analysis Summaries', 
    emoji: '🔍',
    category: 'Competitor_Analysis'
  },
  { 
    title: 'Client Research Summaries', 
    emoji: '👥',
    category: 'Client_Research'
  },
  { 
    title: 'General Research Summaries', 
    emoji: '📚',
    category: 'General_Research'
  },
  { 
    title: 'LRMG Knowledge Summaries', 
    emoji: '🧠',
    category: 'LRMG_Knowledge'
  },
  { 
    title: 'Trend Reports Summaries', 
    emoji: '📈',
    category: 'Trend_Reports'
  },
  { 
    title: 'Business Reports Summaries', 
    emoji: '💼',
    category: 'Business_Reports'
  },
  { 
    title: 'Shareholder Reports Summaries', 
    emoji: '📑',
    category: 'Shareholder_Reports'
  },
  { 
    title: 'Qualitative Data Summaries', 
    emoji: '📝',
    category: 'Qualitative_Data'
  },
  { 
    title: 'Quantitative Data Summaries', 
    emoji: '📊',
    category: 'Quantitative_Data'
  },
];

export default function RightColumn({ onSourceAdded }) {
  const [addSourcesModalOpen, setAddSourcesModalOpen] = useState(false);
  const [sourceLibraryModalOpen, setSourceLibraryModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState(null);

  // Handle Add Sources Modal
  const handleAddSourcesOpen = () => setAddSourcesModalOpen(true);
  const handleAddSourcesClose = () => setAddSourcesModalOpen(false);

  // Handle Source Library Modal
  const handleSourceLibraryOpen = () => setSourceLibraryModalOpen(true);
  const handleSourceLibraryClose = () => setSourceLibraryModalOpen(false);

  // Handle category summaries modal
  const handleCategoryClick = (title, category) => {
    setModalTitle(title);
    setModalContent(
      <CategorySummaries 
        category={category} 
        onClose={() => setModalOpen(false)} 
      />
    );
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 2,
        backgroundColor: 'background.default',
        borderLeft: 1,
        borderColor: 'divider',
      }}
    >
      {/* Source Management Section */}
      <Paper elevation={0} sx={{ p: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSourcesOpen}
            size="small"
            fullWidth
          >
            Add Sources
          </Button>
          <Button
            variant="outlined"
            onClick={handleSourceLibraryOpen}
            size="small"
            fullWidth
          >
            Source Library
          </Button>
        </Stack>
      </Paper>

      {/* Doc Hub Summaries Section */}
      <Paper 
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Section Title */}
        <Typography 
          variant="h6" 
          fontWeight="bold"
          color="text.primary"
        >
          Doc Hub Summaries
        </Typography>

        {/* Navigation Links */}
        <List disablePadding>
          {navigationLinks.map((link) => (
            <ListItem
              key={link.title}
              disablePadding
              sx={{ mb: 1 }}
            >
              <Button
                fullWidth
                onClick={() => handleCategoryClick(link.title, link.category)}
                sx={{
                  justifyContent: 'flex-start',
                  color: 'primary.main',
                  py: 1,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                startIcon={
                  <span role="img" aria-label={link.title} style={{ fontSize: '1.2rem' }}>
                    {link.emoji}
                  </span>
                }
                endIcon={<ArrowIcon />}
              >
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ 
                    flexGrow: 1, 
                    textAlign: 'left',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.title}
                </Typography>
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Add Sources Modal */}
      <CustomModal
        open={addSourcesModalOpen}
        handleClose={handleAddSourcesClose}
        title="Add Sources"
      >
        <AddSourcesModal
          onSourceAdded={(source) => {
            onSourceAdded(source);
            handleAddSourcesClose();
          }}
          onClose={handleAddSourcesClose}
        />
      </CustomModal>

      {/* Source Library Modal */}
      <CustomModal
        open={sourceLibraryModalOpen}
        handleClose={handleSourceLibraryClose}
        title="Source Library"
      >
        <SourceLibraryModal
          onClose={handleSourceLibraryClose}
        />
      </CustomModal>

      {/* Category Summaries Modal */}
      <CustomModal
        open={modalOpen}
        handleClose={handleModalClose}
        title={modalTitle}
      >
        {modalContent}
      </CustomModal>
    </Box>
  );
}