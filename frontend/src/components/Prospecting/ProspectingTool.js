import React, { useState, useContext } from 'react';
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
  DialogActions
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
  const [companyResults, setCompanyResults] = useState([]);
  const [savedProspects, setSavedProspects] = useState([]);
  
  // People Search Form State
  const [peopleSearch, setPeopleSearch] = useState({
    personTitles: [],
    personSeniorities: [],
    personLocations: [],
    organizationLocations: [],
    organizationDomains: [],
    emailStatus: [],
    companySize: '',
    keywords: ''
  });
  
  // Company Search Form State
  const [companySearch, setCompanySearch] = useState({
    companyName: '',
    locations: [],
    employeeRange: '',
    revenueMin: '',
    revenueMax: '',
    industries: [],
    technologies: [],
    fundingStage: ''
  });

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
  };

  const handleTestConnection = async () => {
    try {
      console.log('Testing Apollo connection...');
      
      // Use the backend URL for API calls
      const testUrl = `${BACKEND_URL}/apollo/test`;
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors'
      });
      
      console.log('Test response status:', response.status);
      console.log('Test response headers:', response.headers);
      console.log('Test response content-type:', response.headers.get('content-type'));
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Test response data:', data);
        
        if (response.ok) {
          alert(`✅ Connection test successful! 
API Key: ${data.api_key_configured ? '✅ Configured' : '❌ Missing'}
Server: ${data.server_running ? '✅ Running' : '❌ Down'}
Timestamp: ${data.timestamp}`);
        } else {
          alert(`❌ Connection test failed: ${data.message || 'Unknown error'}`);
        }
      } else {
        // Handle non-JSON response
        const errorText = await response.text();
        console.error('Non-JSON response:', errorText);
        alert(`❌ Connection test failed: Server returned non-JSON response\nStatus: ${response.status}\nContent: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error('Test connection error:', error);
      alert(`❌ Connection test failed: ${error.message}
      
This could be due to:
- Backend server not running
- CORS configuration issue  
- Network connectivity problem
- Route not properly configured`);
    }
  };

  const handlePeopleSearch = async () => {
    setLoading(true);
    console.log('Starting people search...', peopleSearch);
    
    try {
      const requestBody = {
        person_titles: peopleSearch.personTitles,
        person_seniorities: peopleSearch.personSeniorities,
        person_locations: peopleSearch.personLocations,
        organization_locations: peopleSearch.organizationLocations,
        q_organization_domains_list: peopleSearch.organizationDomains,
        contact_email_status: peopleSearch.emailStatus,
        organization_num_employees_ranges: peopleSearch.companySize ? [peopleSearch.companySize] : [],
        q_keywords: peopleSearch.keywords,
        page: 1,
        per_page: 20
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
      setPeopleResults(data.contacts || []);
    } catch (error) {
      console.error('Error searching people:', error);
      alert(`Search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySearch = async () => {
    setLoading(true);
    console.log('Starting company search...', companySearch);
    
    try {
      const requestBody = {
        q_organization_name: companySearch.companyName,
        organization_locations: companySearch.locations,
        organization_num_employees_ranges: companySearch.employeeRange ? [companySearch.employeeRange] : [],
        revenue_range: {
          min: companySearch.revenueMin ? parseInt(companySearch.revenueMin) : undefined,
          max: companySearch.revenueMax ? parseInt(companySearch.revenueMax) : undefined
        },
        q_organization_keyword_tags: companySearch.industries,
        currently_using_any_of_technology_uids: companySearch.technologies,
        page: 1,
        per_page: 20
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${BACKEND_URL}/apollo/company-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token || 'no-token'}`,
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      setCompanyResults(data.organizations || []);
    } catch (error) {
      console.error('Error searching companies:', error);
      alert(`Search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveProspect = async (prospect, type) => {
    try {
      const response = await fetch(`${BACKEND_URL}/prospects/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          type,
          data: prospect,
          user_id: user.id
        })
      });
      
      if (response.ok) {
        // Update UI to show saved state
        console.log('Prospect saved successfully');
      }
    } catch (error) {
      console.error('Error saving prospect:', error);
    }
  };

  return (
    <StyledContainer>
      <Box sx={{ p: 3, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="h4" sx={{ color: '#1a2332', fontWeight: 600, mb: 1 }}>
          Sales Prospecting
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Find and research potential customers using Apollo.io
        </Typography>
        <Button 
          onClick={handleTestConnection}
          variant="outlined"
          size="small"
          sx={{ mt: 2 }}
        >
          Test Connection
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#ffffff' }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3 }}>
          <Tab icon={<PersonIcon />} label="People Search" />
          <Tab icon={<BusinessIcon />} label="Company Search" />
          <Tab icon={<BookmarkIcon />} label="Saved Prospects" />
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
                <TextField
                  fullWidth
                  label="Job Titles (comma separated)"
                  placeholder="sales manager, marketing director"
                  value={peopleSearch.personTitles.join(', ')}
                  onChange={(e) => setPeopleSearch({
                    ...peopleSearch,
                    personTitles: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                />
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
                <TextField
                  fullWidth
                  label="Person Locations"
                  placeholder="California, New York, London"
                  value={peopleSearch.personLocations.join(', ')}
                  onChange={(e) => setPeopleSearch({
                    ...peopleSearch,
                    personLocations: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Domains"
                  placeholder="apollo.io, salesforce.com"
                  value={peopleSearch.organizationDomains.join(', ')}
                  onChange={(e) => setPeopleSearch({
                    ...peopleSearch,
                    organizationDomains: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                />
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
                <TextField
                  fullWidth
                  label="Keywords"
                  placeholder="SaaS, enterprise software"
                  value={peopleSearch.keywords}
                  onChange={(e) => setPeopleSearch({
                    ...peopleSearch,
                    keywords: e.target.value
                  })}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
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

          <ResultsContainer>
            {peopleResults.map((person) => (
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
                    </Box>
                    <IconButton
                      onClick={() => saveProspect(person, 'person')}
                      sx={{ color: '#1a2332' }}
                    >
                      <BookmarkBorderIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {person.email && (
                      <Button
                        size="small"
                        startIcon={<EmailIcon />}
                        variant="outlined"
                        sx={{ borderRadius: '20px' }}
                      >
                        Email
                      </Button>
                    )}
                    {person.phone_numbers?.[0] && (
                      <Button
                        size="small"
                        startIcon={<PhoneIcon />}
                        variant="outlined"
                        sx={{ borderRadius: '20px' }}
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
            ))}
          </ResultsContainer>
        </TabPanel>

        {/* Company Search Tab */}
        <TabPanel value={tabValue} index={1}>
          <SearchContainer>
            <Typography variant="h6" sx={{ mb: 3, color: '#1a2332' }}>
              Find Companies
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  placeholder="Apollo, Salesforce"
                  value={companySearch.companyName}
                  onChange={(e) => setCompanySearch({
                    ...companySearch,
                    companyName: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Locations"
                  placeholder="San Francisco, New York"
                  value={companySearch.locations.join(', ')}
                  onChange={(e) => setCompanySearch({
                    ...companySearch,
                    locations: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Company Size</InputLabel>
                  <Select
                    value={companySearch.employeeRange}
                    onChange={(e) => setCompanySearch({
                      ...companySearch,
                      employeeRange: e.target.value
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
                <TextField
                  fullWidth
                  label="Industry Keywords"
                  placeholder="SaaS, fintech, healthcare"
                  value={companySearch.industries.join(', ')}
                  onChange={(e) => setCompanySearch({
                    ...companySearch,
                    industries: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleCompanySearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{
                  backgroundColor: '#1a2332',
                  '&:hover': { backgroundColor: '#2d3748' },
                  borderRadius: '12px',
                  px: 4
                }}
              >
                {loading ? 'Searching...' : 'Search Companies'}
              </Button>
            </Box>
          </SearchContainer>

          <ResultsContainer>
            {companyResults.map((company) => (
              <ProspectCard key={company.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      src={company.logo_url}
                      sx={{ width: 60, height: 60, mr: 2 }}
                      variant="rounded"
                    >
                      <BusinessIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#1a2332', mb: 0.5 }}>
                        {company.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                        {company.website_url}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Founded: {company.founded_year}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => saveProspect(company, 'company')}
                      sx={{ color: '#1a2332' }}
                    >
                      <BookmarkBorderIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {company.website_url && (
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '20px' }}
                        onClick={() => window.open(company.website_url, '_blank')}
                      >
                        Visit Website
                      </Button>
                    )}
                    {company.linkedin_url && (
                      <Button
                        size="small"
                        startIcon={<LinkedInIcon />}
                        variant="outlined"
                        sx={{ borderRadius: '20px' }}
                        onClick={() => window.open(company.linkedin_url, '_blank')}
                      >
                        LinkedIn
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </ProspectCard>
            ))}
          </ResultsContainer>
        </TabPanel>

        {/* Saved Prospects Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 3, color: '#1a2332' }}>
            Saved Prospects
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Your saved prospects will appear here once you save some contacts and companies.
          </Typography>
        </TabPanel>
      </Box>
    </StyledContainer>
  );
}

export default ProspectingTool;
