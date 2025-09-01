# Sales Prospecting Feature Setup Guide

This guide will help you set up the new sales prospecting feature that integrates with Apollo.io for finding and managing prospects.

## Overview

The prospecting feature allows sales teams to:
- Search for people using job titles, seniorities, locations, and company criteria
- Search for companies using size, location, revenue, and technology filters
- Save prospects and companies for later follow-up
- Manage prospect research notes and follow-up tasks

## Prerequisites

1. **Apollo.io API Access**: You need an Apollo.io account with API access
2. **Supabase Database**: Your existing Supabase setup
3. **Backend Environment**: Your Flask backend with environment variable support

## Setup Steps

### 1. Get Apollo.io API Key

1. Sign up or log in to [Apollo.io](https://apollo.io)
2. Navigate to Settings → Integrations → API
3. Generate or copy your API key
4. Keep this key secure - you'll need it for the environment configuration

### 2. Configure Environment Variables

Add the following environment variable to your backend configuration:

**For Local Development (.env file):**
```bash
APOLLO_API_KEY=your_apollo_api_key_here
```

**For Production (Render Environment Variables):**
```bash
# In your Render dashboard, add:
APOLLO_API_KEY = your_apollo_api_key_here
```

### 3. Run Database Migrations

Execute the SQL migration file in your Supabase database:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `backend/supabase_migrations/create_prospect_tables.sql`
4. Run the query to create the required tables

**Tables Created:**
- `saved_prospects` - Individual contacts/people
- `saved_companies` - Organization prospects  
- `prospect_research_notes` - Research notes and follow-up tasks

### 4. Update Backend Dependencies

Ensure your backend has the `requests` library:

```bash
pip install requests
```

Add to `requirements.txt`:
```
requests>=2.31.0
```

### 5. Deploy Backend Changes

1. **Local Testing:**
   ```bash
   cd backend
   python run.py
   ```

2. **Production Deployment:**
   - Commit your changes to git
   - Push to your repository
   - Render will automatically deploy the new routes

### 6. Frontend Integration

The frontend components are already created and integrated:
- New "Prospecting" button in the sidebar
- Comprehensive search interface with filters
- Results display with save functionality
- Tabbed interface for people, companies, and saved prospects

## API Endpoints Added

### Apollo.io Integration
- `POST /apollo/people-search` - Search for people using Apollo.io
- `POST /apollo/company-search` - Search for companies using Apollo.io

### Prospect Management
- `POST /prospects/save` - Save a person or company prospect
- `GET /prospects/list` - List saved prospects for a user

## Usage

### People Search
1. Click "Prospecting" in the sidebar
2. Use "People Search" tab
3. Enter search criteria:
   - Job titles (e.g., "sales manager, marketing director")
   - Seniority levels (VP, Director, Manager, etc.)
   - Person locations
   - Company domains
   - Company size ranges
   - Keywords

### Company Search  
1. Use "Company Search" tab
2. Enter search criteria:
   - Company name
   - Locations
   - Employee count ranges
   - Industry keywords
   - Revenue ranges (backend support ready)

### Save Prospects
- Click the bookmark icon on any search result
- Access saved prospects in the "Saved Prospects" tab
- Manage notes and follow-up tasks (future enhancement)

## Security Features

- **Row Level Security (RLS)**: Users can only access their own prospects
- **API Key Security**: Apollo API key stored securely in environment variables  
- **User Authentication**: All prospect data tied to authenticated users
- **Data Validation**: Input validation on all API endpoints

## Rate Limits & Costs

**Apollo.io API Limits:**
- Free tier: Limited searches per month
- Paid plans: Higher limits and additional features
- Monitor your usage in the Apollo.io dashboard

**Recommendations:**
- Start with targeted searches to maximize API efficiency
- Use multiple search criteria to get more relevant results
- Consider Apollo.io's paid plans for heavy usage

## Troubleshooting

### Common Issues

1. **"Apollo API key not configured" error**
   - Verify `APOLLO_API_KEY` environment variable is set
   - Restart your backend server after adding the variable

2. **Database table errors**
   - Ensure the SQL migration has been run in Supabase
   - Check that RLS policies are enabled

3. **Search returns no results**
   - Try broader search criteria
   - Check Apollo.io dashboard for API usage limits
   - Verify your Apollo.io account has search credits

4. **CORS errors**
   - Ensure frontend URL is in CORS origins configuration
   - Check that all new routes include `@cross_origin` decorator

### Logging

Enable debug logging to troubleshoot API issues:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

The current implementation provides a solid foundation. Potential future enhancements include:

1. **Enhanced Prospect Management**
   - Add notes and tags to saved prospects
   - Follow-up task management
   - Prospect status tracking (contacted, qualified, etc.)

2. **Email Integration**
   - Direct email sending from prospect cards
   - Email template management
   - Email tracking and responses

3. **CRM Integration**
   - Export prospects to popular CRMs
   - Sync prospect status updates
   - Integration with existing sales workflows

4. **Advanced Analytics**
   - Prospecting activity reporting
   - Conversion tracking
   - ROI analysis

## Support

For issues related to:
- **Apollo.io API**: Check [Apollo.io documentation](https://docs.apollo.io/)
- **Supabase**: Refer to [Supabase documentation](https://supabase.com/docs)
- **Feature bugs**: Check application logs and network requests in browser dev tools

## API Usage Examples

### People Search Request
```javascript
POST /apollo/people-search
{
  "person_titles": ["sales manager", "marketing director"],
  "person_seniorities": ["vp", "director"],
  "organization_locations": ["california", "new york"],
  "organization_num_employees_ranges": ["51,200"],
  "page": 1,
  "per_page": 20
}
```

### Company Search Request
```javascript
POST /apollo/company-search
{
  "q_organization_name": "apollo",
  "organization_locations": ["san francisco"],
  "organization_num_employees_ranges": ["201,500"],
  "q_organization_keyword_tags": ["saas", "software"],
  "page": 1,
  "per_page": 20
}
```

Your prospecting feature is now ready for use!
