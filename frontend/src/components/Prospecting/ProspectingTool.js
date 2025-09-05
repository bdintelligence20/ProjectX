import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ResearchIcon from '@mui/icons-material/Science';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AuthContext from '../../AuthContext';

// Backend URL configuration
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://projectx-53gn.onrender.com';

const StyledContainer = styled(Box)(() => ({
  height: 'calc(100vh - 120px)',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#faf9f7',
}));

const SearchContainer = styled(Paper)(() => ({
  padding: '24px',
  marginBottom: '24px',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
}));

const ResultsContainer = styled(Box)(() => ({
  flex: 1,
  overflowY: 'auto',
  padding: '0 24px',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#cbd5e0',
    borderRadius: '4px',
  },
}));

const ProspectCard = styled(Card)(() => ({
  marginBottom: '16px',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
}));

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function ProspectingTool() {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [peopleResults, setPeopleResults] = useState([]);
  const [savedProspects, setSavedProspects] = useState([]);
  const [savedResearch, setSavedResearch] = useState([]);
  const [searchWarning, setSearchWarning] = useState('');
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditBalance, setCreditBalance] = useState({ used: 170, total: 3015 }); // You can fetch this from backend
  const [savedItems, setSavedItems] = useState(new Set()); // Track saved items
  const [saveMessage, setSaveMessage] = useState(''); // Show save status
  const [researchModal, setResearchModal] = useState(false);
  const [currentResearch, setCurrentResearch] = useState(null);
  const [researchLoading, setResearchLoading] = useState(false);
  
  // People Search Form State
  const [peopleSearch, setPeopleSearch] = useState({
    personTitles: [],
    personSeniorities: [],
    personLocations: '',
    organizationLocations: [],
    emailStatus: [],
    companySize: '',
    departments: [],
    industries: []
  });

  const jobTitles = [
    { category: 'C-Level', titles: [
      { value: 'CEO', label: 'Chief Executive Officer (CEO)' },
      { value: 'CFO', label: 'Chief Financial Officer (CFO)' },
      { value: 'CTO', label: 'Chief Technology Officer (CTO)' },
      { value: 'COO', label: 'Chief Operating Officer (COO)' },
      { value: 'CMO', label: 'Chief Marketing Officer (CMO)' },
      { value: 'CHRO', label: 'Chief HR Officer (CHRO)' },
      { value: 'CIO', label: 'Chief Information Officer (CIO)' },
      { value: 'CLO', label: 'Chief Learning Officer (CLO)' },
      { value: 'Chief Transformation Officer', label: 'Chief Transformation Officer' }
    ]},
    { category: 'Learning & Development Leadership', titles: [
      { value: 'VP Learning & Development', label: 'VP Learning & Development' },
      { value: 'Director of Learning & Development', label: 'Director of Learning & Development' },
      { value: 'Head of Learning & Development', label: 'Head of Learning & Development' },
      { value: 'Head of Learning', label: 'Head of Learning' },
      { value: 'Director of Talent Development', label: 'Director of Talent Development' },
      { value: 'Head of Talent Development', label: 'Head of Talent Development' },
      { value: 'Director of Training', label: 'Director of Training' },
      { value: 'Head of Training', label: 'Head of Training' },
      { value: 'Learning Director', label: 'Learning Director' }
    ]},
    { category: 'HR Leadership', titles: [
      { value: 'HR Director', label: 'HR Director' },
      { value: 'Head of HR', label: 'Head of HR' },
      { value: 'Group HR Executive', label: 'Group HR Executive' },
      { value: 'VP Human Resources', label: 'VP Human Resources' },
      { value: 'Director of Human Resources', label: 'Director of Human Resources' },
      { value: 'Head of People', label: 'Head of People' },
      { value: 'Chief People Officer', label: 'Chief People Officer (CPO)' }
    ]},
    { category: 'Transformation & Change Leadership', titles: [
      { value: 'Head of Transformation', label: 'Head of Transformation' },
      { value: 'Director of Transformation', label: 'Director of Transformation' },
      { value: 'Strategy Executive', label: 'Strategy Executive' },
      { value: 'Head of Change', label: 'Head of Change' },
      { value: 'Director of Change Management', label: 'Director of Change Management' },
      { value: 'Head of Organizational Development', label: 'Head of Organizational Development' },
      { value: 'Director of Organizational Development', label: 'Director of Organizational Development' }
    ]},
    { category: 'L&D Management', titles: [
      { value: 'L&D Manager', label: 'L&D Manager' },
      { value: 'Learning & Development Manager', label: 'Learning & Development Manager' },
      { value: 'Training Manager', label: 'Training Manager' },
      { value: 'Talent Development Manager', label: 'Talent Development Manager' },
      { value: 'Learning Manager', label: 'Learning Manager' },
      { value: 'Organizational Development Manager', label: 'Organizational Development Manager' },
      { value: 'Change Management Manager', label: 'Change Management Manager' },
      { value: 'Performance Manager', label: 'Performance Manager' },
      { value: 'Capability Manager', label: 'Capability Manager' }
    ]},
    { category: 'L&D Specialists & Consultants', titles: [
      { value: 'Learning Consultant', label: 'Learning Consultant' },
      { value: 'Learning Lead', label: 'Learning Lead' },
      { value: 'L&D Specialist', label: 'L&D Specialist' },
      { value: 'Learning & Development Specialist', label: 'Learning & Development Specialist' },
      { value: 'Training Specialist', label: 'Training Specialist' },
      { value: 'Learning Designer', label: 'Learning Designer' },
      { value: 'Learning Experience Designer', label: 'Learning Experience Designer' },
      { value: 'Instructional Designer', label: 'Instructional Designer' },
      { value: 'Performance Consultant', label: 'Performance Consultant' },
      { value: 'Change Management Consultant', label: 'Change Management Consultant' },
      { value: 'Organizational Development Consultant', label: 'Organizational Development Consultant' },
      { value: 'Talent Development Consultant', label: 'Talent Development Consultant' },
      { value: 'Learning Facilitator', label: 'Learning Facilitator' },
      { value: 'Training Coordinator', label: 'Training Coordinator' },
      { value: 'Learning Coordinator', label: 'Learning Coordinator' }
    ]},
    { category: 'Technology Leadership', titles: [
      { value: 'IT Director', label: 'IT Director' },
      { value: 'Head of Technology', label: 'Head of Technology' },
      { value: 'Head of IT', label: 'Head of IT' },
      { value: 'VP Technology', label: 'VP Technology' },
      { value: 'VP Information Technology', label: 'VP Information Technology' }
    ]},
    { category: 'Procurement & Operations', titles: [
      { value: 'Procurement Manager', label: 'Procurement Manager' },
      { value: 'Head of Procurement', label: 'Head of Procurement' },
      { value: 'Strategic Sourcing Lead', label: 'Strategic Sourcing Lead' },
      { value: 'Supply Chain Specialist', label: 'Supply Chain Specialist' },
      { value: 'Procurement Specialist', label: 'Procurement Specialist' },
      { value: 'Director of Procurement', label: 'Director of Procurement' }
    ]},
    { category: 'Director Level', titles: [
      { value: 'Director of Sales', label: 'Director of Sales' },
      { value: 'Director of Marketing', label: 'Director of Marketing' },
      { value: 'Director of Engineering', label: 'Director of Engineering' },
      { value: 'Director of Product', label: 'Director of Product' },
      { value: 'Director of Operations', label: 'Director of Operations' },
      { value: 'Director of Finance', label: 'Director of Finance' }
    ]},
    { category: 'Management', titles: [
      { value: 'Sales Manager', label: 'Sales Manager' },
      { value: 'Marketing Manager', label: 'Marketing Manager' },
      { value: 'Product Manager', label: 'Product Manager' },
      { value: 'Project Manager', label: 'Project Manager' },
      { value: 'Account Manager', label: 'Account Manager' },
      { value: 'Engineering Manager', label: 'Engineering Manager' },
      { value: 'HR Manager', label: 'HR Manager' },
      { value: 'People Manager', label: 'People Manager' }
    ]},
    { category: 'Individual Contributors', titles: [
      { value: 'Software Engineer', label: 'Software Engineer' },
      { value: 'Account Executive', label: 'Account Executive' },
      { value: 'Business Analyst', label: 'Business Analyst' },
      { value: 'Sales Representative', label: 'Sales Representative' },
      { value: 'Marketing Specialist', label: 'Marketing Specialist' },
      { value: 'HR Business Partner', label: 'HR Business Partner' },
      { value: 'HR Generalist', label: 'HR Generalist' }
    ]},
    { category: 'Other', titles: [
      { value: 'Founder', label: 'Founder' },
      { value: 'Owner', label: 'Owner' },
      { value: 'Partner', label: 'Partner' },
      { value: 'Consultant', label: 'Consultant' }
    ]}
  ];

  const departments = [
    { value: 'learning_development', label: 'Learning & Development' },
    { value: 'talent_development', label: 'Talent Development' },
    { value: 'training', label: 'Training' },
    { value: 'organizational_development', label: 'Organizational Development' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'people', label: 'People & Culture' },
    { value: 'transformation', label: 'Transformation' },
    { value: 'change_management', label: 'Change Management' },
    { value: 'strategy', label: 'Strategy' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'product', label: 'Product' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'it', label: 'Information Technology' },
    { value: 'customer_success', label: 'Customer Success' }
  ];

  const industries = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'education', label: 'Education' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'transportation', label: 'Transportation & Logistics' }
  ];

  const locationOptions = [
    { value: 'South Africa', label: 'South Africa' },
    { value: 'Kenya', label: 'Kenya' }
  ];

  const seniorities = [
    { value: 'owner', label: 'Owner' },
    { value: 'founder', label: 'Founder' },
    { value: 'c_suite', label: 'C-Suite' },
    { value: 'vp', label: 'VP' },
    { value: 'director', label: 'Director' },
    { value: 'manager', label: 'Manager' },
    { value: 'senior', label: 'Senior' },
    { value: 'entry', label: 'Entry Level' }
  ];

  const employeeRanges = [
    { value: '1,10', label: '1-10 employees' },
    { value: '11,50', label: '11-50 employees' },
    { value: '51,200', label: '51-200 employees' },
    { value: '201,500', label: '201-500 employees' },
    { value: '501,1000', label: '501-1,000 employees' },
    { value: '1001,5000', label: '1,001-5,000 employees' },
    { value: '5001,10000', label: '5,001-10,000 employees' },
    { value: '10000,50000', label: '10,000+ employees' }
  ];

  const emailStatuses = [
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' },
    { value: 'likely_to_engage', label: 'Likely to Engage' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) {
      loadSavedProspects(); // Load saved prospects when switching to that tab
    } else if (newValue === 2) {
      loadSavedResearch(); // Load saved research when switching to that tab
    }
  };

  const handlePeopleSearch = async () => {
    setLoading(true);
    console.log('Starting people search...', peopleSearch);
    
    try {
      const requestBody = {
        person_titles: peopleSearch.personTitles,
        person_seniorities: peopleSearch.personSeniorities,
        person_locations: peopleSearch.personLocations ? [peopleSearch.personLocations] : [],
        organization_locations: peopleSearch.organizationLocations,
        contact_email_status: peopleSearch.emailStatus,
        organization_num_employees_ranges: peopleSearch.companySize ? [peopleSearch.companySize] : [],
        departments: peopleSearch.departments,
        q_organization_keyword_tags: peopleSearch.industries,
        page: 1,
        per_page: 50  // Limit to 50 results to conserve credits
      };
      
      console.log('Request body:', requestBody);
      console.log('User context:', user);
      
      const response = await fetch(`${BACKEND_URL}/apollo/people-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token || 'no-token'}`,
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      // Check for warning message about credits/permissions
      if (data.warning) {
        setSearchWarning(data.warning);
      } else {
        setSearchWarning('');
      }
      
      setPeopleResults(data.contacts || []);
      setCreditsUsed(data.credits_used || 0);
    } catch (error) {
      console.error('Error searching people:', error);
      alert(`Search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveProspect = async (prospect, type) => {
    try {
      // Get user ID from the user object (might be user.id or user.user.id depending on structure)
      const userId = user?.id || user?.user?.id || user?.sub;
      
      if (!userId) {
        console.error('User ID not found:', user);
        alert('Unable to save: User ID not found. Please try logging in again.');
        return;
      }

      console.log('Saving prospect:', { type, userId, prospect });
      
      const response = await fetch(`${BACKEND_URL}/prospects/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token || ''}`,
        },
        body: JSON.stringify({
          type,
          data: prospect,
          user_id: userId
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Prospect saved successfully:', result);
        
        // Update UI to show saved state
        setSavedItems(prev => new Set([...prev, prospect.id]));
        setSaveMessage(`${type === 'person' ? 'Contact' : 'Company'} saved successfully!`);
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(''), 3000);
        
        // If on saved prospects tab, refresh the list
        if (tabValue === 1) {
          loadSavedProspects();
        }
      } else {
        const error = await response.text();
        console.error('Save failed:', error);
        alert(`Failed to save ${type}: ${error}`);
      }
    } catch (error) {
      console.error('Error saving prospect:', error);
      alert(`Error saving ${type}: ${error.message}`);
    }
  };

  const loadSavedProspects = async () => {
    try {
      const userId = user?.id || user?.user?.id || user?.sub;
      if (!userId) return;
      
      const response = await fetch(`${BACKEND_URL}/prospects/list?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token || ''}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedProspects(data);
      }
    } catch (error) {
      console.error('Error loading saved prospects:', error);
    }
  };

  const loadSavedResearch = async () => {
    try {
      const userId = user?.id || user?.user?.id || user?.sub;
      if (!userId) return;
      
      const response = await fetch(`${BACKEND_URL}/research/list?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token || ''}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedResearch(data.research || []);
        }
      }
    } catch (error) {
      console.error('Error loading saved research:', error);
    }
  };

  const handleResearchProspect = async (person) => {
    setResearchLoading(true);
    setResearchModal(true);
    setCurrentResearch(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/apollo/research-prospect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token || ''}`,
        },
        body: JSON.stringify({
          name: person.name,
          email: person.email,
          title: person.title,
          company_name: person.organization_name || person.account?.name || 'Unknown Company',
          linkedin_url: person.linkedin_url,
          company_website: person.account?.website_url || person.organization?.website_url || null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Research API response:', data);
        
        if (data.success && data.report) {
          console.log('Setting research report:', data.report);
          setCurrentResearch(data.report);
        } else {
          console.error('Research generation failed:', data);
          alert(`Failed to generate research: ${data.error || 'Unknown error'}`);
          setResearchModal(false);
        }
      } else {
        alert('Failed to generate research report');
        setResearchModal(false);
      }
    } catch (error) {
      console.error('Error researching prospect:', error);
      alert('Error generating research report');
      setResearchModal(false);
    } finally {
      setResearchLoading(false);
    }
  };

  const handleSaveResearch = async () => {
    if (!currentResearch) return;
    
    try {
      const userId = user?.id || user?.user?.id || user?.sub;
      const response = await fetch(`${BACKEND_URL}/research/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token || ''}`,
        },
        body: JSON.stringify({
          user_id: userId,
          report: currentResearch
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Research saved successfully!');
          setResearchModal(false);
          if (tabValue === 2) {
            loadSavedResearch();
          }
        } else {
          alert(`Failed to save research: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('Error saving research:', error);
      alert('Error saving research report');
    }
  };

  const handleDeleteResearch = async (researchId) => {
    if (!window.confirm('Are you sure you want to delete this research?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/research/${researchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.access_token || ''}`,
        }
      });
      
      if (response.ok) {
        loadSavedResearch();
      }
    } catch (error) {
      console.error('Error deleting research:', error);
    }
  };

  return (
    <StyledContainer>
      <Box sx={{ p: 3, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#1a2332', fontWeight: 600, mb: 1 }}>
              Sales Prospecting
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Find and research potential customers using Apollo.io
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              Apollo Credits
            </Typography>
            <Typography variant="h6" sx={{ color: '#1a2332', fontWeight: 600 }}>
              {(creditBalance.total - creditBalance.used).toLocaleString()} / {creditBalance.total.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              remaining this month
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#ffffff' }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3 }}>
          <Tab icon={<PersonIcon />} label="People Search" />
          <Tab icon={<BookmarkIcon />} label="Saved Prospects" />
          <Tab icon={<ResearchIcon />} label="Research Reports" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, p: 3 }}>
        {/* People Search Tab */}
        <TabPanel value={tabValue} index={0}>
          <SearchContainer>
            <Typography variant="h6" sx={{ mb: 3, color: '#1a2332' }}>
              Find People
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Job Titles</InputLabel>
                  <Select
                    multiple
                    value={peopleSearch.personTitles}
                    onChange={(e) => setPeopleSearch({
                      ...peopleSearch,
                      personTitles: e.target.value
                    })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {jobTitles.map((category) => [
                      <MenuItem key={category.category} disabled sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        {category.category}
                      </MenuItem>,
                      ...category.titles.map((title) => (
                        <MenuItem key={title.value} value={title.value} sx={{ pl: 4 }}>
                          {title.label}
                        </MenuItem>
                      ))
                    ])}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Seniority Level</InputLabel>
                  <Select
                    multiple
                    value={peopleSearch.personSeniorities}
                    onChange={(e) => setPeopleSearch({
                      ...peopleSearch,
                      personSeniorities: e.target.value
                    })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={seniorities.find(s => s.value === value)?.label} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {seniorities.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Person Location</InputLabel>
                  <Select
                    value={peopleSearch.personLocations}
                    onChange={(e) => setPeopleSearch({
                      ...peopleSearch,
                      personLocations: e.target.value
                    })}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {locationOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Company Size</InputLabel>
                  <Select
                    value={peopleSearch.companySize}
                    onChange={(e) => setPeopleSearch({
                      ...peopleSearch,
                      companySize: e.target.value
                    })}
                  >
                    {employeeRanges.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    multiple
                    value={peopleSearch.departments}
                    onChange={(e) => setPeopleSearch({
                      ...peopleSearch,
                      departments: e.target.value
                    })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={departments.find(d => d.value === value)?.label} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    multiple
                    value={peopleSearch.industries}
                    onChange={(e) => setPeopleSearch({
                      ...peopleSearch,
                      industries: e.target.value
                    })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={industries.find(i => i.value === value)?.label} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {industries.map((industry) => (
                      <MenuItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Alert severity="info" sx={{ maxWidth: '400px' }}>
                This search will use up to <strong>50 credits</strong>
              </Alert>
              <Button
                variant="contained"
                size="large"
                onClick={handlePeopleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{
                  backgroundColor: '#1a2332',
                  '&:hover': { backgroundColor: '#2d3748' },
                  borderRadius: '12px',
                  px: 4
                }}
              >
                {loading ? 'Searching...' : 'Search People'}
              </Button>
            </Box>
          </SearchContainer>

          {saveMessage && (
            <Alert severity="success" sx={{ mb: 2, mx: 3 }}>
              {saveMessage}
            </Alert>
          )}

          {searchWarning && (
            <Alert severity="warning" sx={{ mb: 2, mx: 3 }}>
              <AlertTitle>Search Results Limited</AlertTitle>
              {searchWarning}
              <br />
              <Typography variant="body2" sx={{ mt: 1 }}>
                This usually occurs when:
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  <li>Your Apollo API key has insufficient credits</li>
                  <li>The API key lacks proper permissions</li>
                  <li>You've reached your rate limit</li>
                </ul>
                Please check your Apollo.io account and API key configuration.
              </Typography>
            </Alert>
          )}

          <ResultsContainer>
            {peopleResults.length === 0 && !loading && !searchWarning ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
                  No results found
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Try adjusting your search criteria or add more search terms
                </Typography>
              </Box>
            ) : (
              peopleResults.map((person) => (
              <ProspectCard key={person.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      src={person.photo_url}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {person.first_name?.[0]}{person.last_name?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#1a2332', mb: 0.5 }}>
                        {person.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                        {person.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {person.organization_name}
                      </Typography>
                      {person.email && person.email !== 'email_not_unlocked@domain.com' && (
                        <Typography variant="body2" sx={{ color: '#2563eb', mt: 0.5 }}>
                          📧 {person.email}
                        </Typography>
                      )}
                      {person.phone_numbers?.[0]?.sanitized_number && (
                        <Typography variant="body2" sx={{ color: '#059669', mt: 0.5 }}>
                          📱 {person.phone_numbers[0].sanitized_number}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      onClick={() => saveProspect(person, 'person')}
                      sx={{ color: savedItems.has(person.id) ? '#10b981' : '#1a2332' }}
                    >
                      {savedItems.has(person.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      startIcon={<ResearchIcon />}
                      variant="contained"
                      sx={{ 
                        borderRadius: '20px',
                        backgroundColor: '#10b981',
                        '&:hover': { backgroundColor: '#059669' }
                      }}
                      onClick={() => handleResearchProspect(person)}
                    >
                      Research
                    </Button>
                    {person.email && person.email !== 'email_not_unlocked@domain.com' && (
                      <Button
                        size="small"
                        startIcon={<EmailIcon />}
                        variant="outlined"
                        sx={{ borderRadius: '20px' }}
                        href={`mailto:${person.email}`}
                      >
                        Email
                      </Button>
                    )}
                    {person.phone_numbers?.[0]?.sanitized_number && (
                      <Button
                        size="small"
                        startIcon={<PhoneIcon />}
                        variant="outlined"
                        sx={{ borderRadius: '20px' }}
                        href={`tel:${person.phone_numbers[0].sanitized_number}`}
                      >
                        Call
                      </Button>
                    )}
                    {person.linkedin_url && (
                      <Button
                        size="small"
                        startIcon={<LinkedInIcon />}
                        variant="outlined"
                        sx={{ borderRadius: '20px' }}
                        onClick={() => window.open(person.linkedin_url, '_blank')}
                      >
                        LinkedIn
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </ProspectCard>
            )))}
          </ResultsContainer>
        </TabPanel>

        {/* Saved Prospects Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 3, color: '#1a2332' }}>
            Saved Prospects
          </Typography>
          
          {savedProspects?.people?.length > 0 || savedProspects?.companies?.length > 0 ? (
            <Box>
              {savedProspects?.people?.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#64748b', fontWeight: 600 }}>
                    Saved Contacts ({savedProspects.people.length})
                  </Typography>
                  <ResultsContainer>
                    {savedProspects.people.map((person) => (
                      <ProspectCard key={person.id}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ color: '#1a2332', mb: 0.5 }}>
                                {person.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748b' }}>
                                {person.title} at {person.company}
                              </Typography>
                              {person.email && (
                                <Typography variant="body2" sx={{ color: '#2563eb', mt: 0.5 }}>
                                  📧 {person.email}
                                </Typography>
                              )}
                              {person.phone && (
                                <Typography variant="body2" sx={{ color: '#059669', mt: 0.5 }}>
                                  📱 {person.phone}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </ProspectCard>
                    ))}
                  </ResultsContainer>
                </>
              )}
              
              {savedProspects?.companies?.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 2, mt: 3, color: '#64748b', fontWeight: 600 }}>
                    Saved Companies ({savedProspects.companies.length})
                  </Typography>
                  <ResultsContainer>
                    {savedProspects.companies.map((company) => (
                      <ProspectCard key={company.id}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ color: '#1a2332', mb: 0.5 }}>
                                {company.company_name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748b' }}>
                                {company.website_url}
                              </Typography>
                              {company.founded_year && (
                                <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                  Founded: {company.founded_year}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </ProspectCard>
                    ))}
                  </ResultsContainer>
                </>
              )}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Your saved prospects will appear here once you save some contacts and companies.
            </Typography>
          )}
        </TabPanel>

        {/* Research Reports Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 3, color: '#1a2332' }}>
            Research Reports
          </Typography>
          
          {savedResearch.length > 0 ? (
            <Box>
              {savedResearch.map((research) => (
                <ProspectCard key={research.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#1a2332', mb: 0.5 }}>
                          {research.prospect_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {research.prospect_title} at {research.company_name}
                        </Typography>
                        {research.prospect_email && (
                          <Typography variant="body2" sx={{ color: '#2563eb', mt: 0.5 }}>
                            📧 {research.prospect_email}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1 }}>
                          Researched: {new Date(research.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Research">
                          <IconButton
                            onClick={() => {
                              setCurrentResearch(research.research_report);
                              setResearchModal(true);
                              setResearchLoading(false);
                            }}
                            sx={{ color: '#1a2332' }}
                          >
                            <ResearchIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Research">
                          <IconButton
                            onClick={() => handleDeleteResearch(research.id)}
                            sx={{ color: '#ef4444' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    {research.research_summary && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                        <Typography variant="body2" sx={{ color: '#475569' }}>
                          {research.research_summary.substring(0, 200)}...
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </ProspectCard>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Your research reports will appear here once you research prospects and save the reports.
            </Typography>
          )}
        </TabPanel>
      </Box>

      {/* Research Modal */}
      <Dialog
        open={researchModal}
        onClose={() => setResearchModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <Typography variant="h6">Prospect Research Report</Typography>
          <IconButton onClick={() => setResearchModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {researchLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2, color: '#64748b' }}>
                Generating research report...
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#94a3b8' }}>
                This may take a few moments as we analyze LinkedIn and company data
              </Typography>
            </Box>
          ) : currentResearch ? (
            <Box>
              {/* Display research report with proper styling */}
              <Box sx={{ 
                lineHeight: 1.8,
                color: '#1a2332',
                '& h1, & h2, & h3': {
                  color: '#1a2332',
                  fontWeight: 600,
                  marginTop: '1.5rem',
                  marginBottom: '1rem'
                },
                '& p': {
                  marginBottom: '1rem',
                  color: '#475569'
                },
                '& ul': {
                  paddingLeft: '1.5rem',
                  marginBottom: '1rem'
                },
                '& li': {
                  marginBottom: '0.5rem',
                  color: '#475569'
                },
                '& strong': {
                  color: '#1a2332',
                  fontWeight: 600
                }
              }}>
                {(() => {
                  // Handle the nested report structure from the backend
                  let reportContent = 'No report content available';
                  
                  if (typeof currentResearch === 'string') {
                    reportContent = currentResearch;
                  } else if (currentResearch && currentResearch.research_report) {
                    reportContent = currentResearch.research_report;
                  } else if (currentResearch && typeof currentResearch === 'object') {
                    // Try to extract the report from possible nested structures
                    console.log('Current research object:', currentResearch);
                    reportContent = currentResearch.report?.research_report || 
                                  currentResearch.research_report || 
                                  JSON.stringify(currentResearch, null, 2);
                  }
                  
                  // Parse and format the report for better display
                  const sections = reportContent.split(/\d+\.\s+/).filter(Boolean);
                  
                  return sections.map((section, index) => {
                    const lines = section.split('\n').filter(line => line.trim());
                    const title = lines[0];
                    const content = lines.slice(1).join('\n');
                    
                    // Format the section with proper HTML-like structure
                    const formattedContent = content
                      .replace(/^-\s+/gm, '• ')  // Replace dashes with bullets
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
                      .split('\n')
                      .map(line => {
                        if (line.startsWith('• ')) {
                          return line;
                        }
                        return line;
                      })
                      .join('\n');
                    
                    return (
                      <Box key={index} sx={{ mb: 3 }}>
                        {title && (
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#1a2332', 
                              fontWeight: 600,
                              mb: 2,
                              borderBottom: '2px solid #e2e8f0',
                              paddingBottom: 1
                            }}
                          >
                            {index > 0 ? `${index}. ` : ''}{title.replace(/^[A-Z\s]+$/, (match) => {
                              // Title case for all-caps headers
                              return match.split(' ')
                                .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                                .join(' ');
                            })}
                          </Typography>
                        )}
                        <Box sx={{ 
                          whiteSpace: 'pre-wrap',
                          '& ul': {
                            listStyle: 'none',
                            paddingLeft: 0
                          }
                        }}>
                          {formattedContent.split('\n').map((line, lineIndex) => {
                            if (line.startsWith('• ')) {
                              return (
                                <Box key={lineIndex} sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start',
                                  mb: 1,
                                  ml: 2
                                }}>
                                  <Box sx={{ 
                                    color: '#10b981', 
                                    marginRight: 1,
                                    fontSize: '1.2rem',
                                    lineHeight: '1.5rem'
                                  }}>
                                    •
                                  </Box>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ color: '#475569', flex: 1 }}
                                    dangerouslySetInnerHTML={{ 
                                      __html: line.substring(2).replace(/<strong>(.*?)<\/strong>/g, '<b>$1</b>') 
                                    }}
                                  />
                                </Box>
                              );
                            }
                            
                            // Check if it's a subsection header
                            if (line && !line.startsWith('• ') && line.endsWith(':')) {
                              return (
                                <Typography 
                                  key={lineIndex}
                                  variant="subtitle1" 
                                  sx={{ 
                                    color: '#1a2332', 
                                    fontWeight: 600,
                                    mt: 2,
                                    mb: 1
                                  }}
                                >
                                  {line}
                                </Typography>
                              );
                            }
                            
                            if (line) {
                              return (
                                <Typography 
                                  key={lineIndex}
                                  variant="body2" 
                                  sx={{ color: '#475569', mb: 1 }}
                                  dangerouslySetInnerHTML={{ 
                                    __html: line.replace(/<strong>(.*?)<\/strong>/g, '<b>$1</b>') 
                                  }}
                                />
                              );
                            }
                            return null;
                          })}
                        </Box>
                      </Box>
                    );
                  });
                })()}
              </Box>
              
              {/* Research metadata */}
              {currentResearch.prospect_info && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Generated: {new Date(currentResearch.generated_at || Date.now()).toLocaleString()}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                    {currentResearch.linkedin_scraped && (
                      <Chip label="LinkedIn Analyzed" size="small" color="primary" />
                    )}
                    {currentResearch.website_scraped && (
                      <Chip label="Website Analyzed" size="small" color="primary" />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Typography>No research data available</Typography>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          {!researchLoading && currentResearch && (
            <Button
              onClick={handleSaveResearch}
              variant="contained"
              sx={{
                backgroundColor: '#10b981',
                '&:hover': { backgroundColor: '#059669' }
              }}
            >
              Save Research
            </Button>
          )}
          <Button onClick={() => setResearchModal(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
}

export default ProspectingTool;
