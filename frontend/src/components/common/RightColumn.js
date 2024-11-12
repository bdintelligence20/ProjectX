import React, { useState } from 'react';
import {
  Box,
  Typography,
  Link,
  Button,
  Paper,
  Stack,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowForwardIos as ArrowIcon,
  Description as SummaryIcon,
  Book as ReportIcon,
  People as ContactsIcon,
  History as ActivityIcon,
} from '@mui/icons-material';
import CustomModal from '../modals/CustomModal';
import FullCompanySummary from '../BusinessDevelopmentResearch/FullCompanySummary';
import AnnualReports from '../BusinessDevelopmentResearch/AnnualReports';
import TopContacts from '../BusinessDevelopmentResearch/TopContacts';
import HubspotActivity from '../BusinessDevelopmentResearch/HubspotActivity';
import AddSourcesModal from '../modals/AddSourcesModal';
import SourceLibraryModal from '../modals/SourceLibraryModal';

const navigationLinks = [
  { title: 'Full Company Summary', icon: <SummaryIcon />, component: FullCompanySummary },
  { title: 'Annual Reports', icon: <ReportIcon />, component: AnnualReports },
  { title: 'Top Contacts', icon: <ContactsIcon />, component: TopContacts },
  { title: 'Hubspot Activity', icon: <ActivityIcon />, component: HubspotActivity },
];

export default function RightColumn({ onSourceAdded }) {
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [ModalContent, setModalContent] = useState(null);

  const handleOpen = (title, Component) => {
    setModalTitle(title);
    setOpen(true);
    setModalContent(
      <Component
        open={true}
        onClose={handleClose}
      />
    );
  };

  const handleClose = () => setOpen(false);

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
            onClick={() => handleOpen('Add Sources', () => <AddSourcesModal onSourceAdded={onSourceAdded} />)}
            size="small"
            fullWidth
          >
            Add Sources
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleOpen('Source Library', SourceLibraryModal)}
            size="small"
            fullWidth
          >
            Source Library
          </Button>
        </Stack>
      </Paper>

      {/* Company Summary Section */}
      <Paper 
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Company Logo */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar
            alt="MTN Logo"
            src="/path/to/mtn-logo.png"
            sx={{ width: 60, height: 60 }}
          />
        </Box>

        {/* Company Title */}
        <Typography 
          variant="h6" 
          align="center"
          fontWeight="bold"
          color="text.primary"
        >
          Company Summary
        </Typography>

        <Divider />

        {/* Summary Content */}
        <Box>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            gutterBottom
          >
            Current State of AI:
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ pl: 2 }}
          >
            Lack of Subjective Experience: Presently, AI lacks the capacity for subjective experience.
          </Typography>
        </Box>

        <Divider />

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
                onClick={() => handleOpen(link.title, link.component)}
                sx={{
                  justifyContent: 'flex-start',
                  color: 'primary.main',
                  py: 1,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                startIcon={link.icon}
                endIcon={<ArrowIcon />}
              >
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ flexGrow: 1, textAlign: 'left' }}
                >
                  {link.title}
                </Typography>
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Modal */}
      <CustomModal 
        open={open} 
        handleClose={handleClose} 
        title={modalTitle}
      >
        {ModalContent}
      </CustomModal>
    </Box>
  );
}