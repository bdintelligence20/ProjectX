# Research Feature Implementation - Prospecting Tool

## Overview
A comprehensive research feature has been added to the Prospecting tool that allows users to generate detailed research reports for prospects by scraping their LinkedIn profiles and company websites.

## Implementation Date
September 3, 2025

## Features Added

### 1. Database
- **New Table**: `prospect_research`
  - Stores research reports with full JSONB data
  - Includes indexes for performance
  - Row Level Security enabled
  - Automatic timestamp updates

### 2. Backend Endpoints

#### Research Generation
- **POST /apollo/research-prospect**
  - Generates research reports by scraping LinkedIn and company websites
  - Extracts domain from prospect email
  - Uses GPT-5-mini to create comprehensive reports
  - Returns structured JSON report

#### Research Management
- **POST /research/save** - Save generated research to database
- **GET /research/list** - List all saved research for a user
- **DELETE /research/:id** - Delete specific research report

### 3. Frontend Features

#### New UI Components
1. **Research Button** on each prospect card
   - Green color for visibility
   - Triggers research generation

2. **Research Reports Tab** (3rd tab)
   - Lists all saved research
   - Shows prospect details and summary
   - View/Delete actions for each report

3. **Research Modal**
   - Shows loading state during generation
   - Displays full research report
   - Save button to persist report
   - Shows metadata (LinkedIn/Website analyzed)

### 4. Research Report Structure

The generated reports include:
1. **Executive Summary**
   - Overview of prospect and company
   - Key insights and opportunities

2. **Professional Profile**
   - Current role and responsibilities
   - Career progression
   - Areas of expertise
   - Professional interests

3. **Company Overview**
   - Business description
   - Products/services
   - Market position
   - Recent developments

4. **Engagement Strategy**
   - Personalized talking points
   - Potential pain points
   - Value propositions
   - Recommended outreach approach

5. **Key Insights**
   - Notable observations
   - Connection opportunities
   - Risk factors

## Technical Details

### Scraping Configuration
- LinkedIn: `max_depth=1, max_chunks=5`
- Company Website: `max_depth=2, max_chunks=10`
- Skips common email domains (gmail, yahoo, etc.)

### LLM Configuration
- Model: GPT-5-mini
- Max tokens: 3000 for research generation
- Custom prompts for sales-focused insights

### Error Handling
- Graceful fallback if LinkedIn/website inaccessible
- User feedback for all error states
- Logging for debugging

## Usage Flow

1. User searches for prospects in People Search
2. Clicks "Research" button on a prospect card
3. Modal opens showing loading state
4. Backend scrapes LinkedIn + company website
5. LLM generates comprehensive report
6. User can save the report
7. Saved reports appear in "Research Reports" tab
8. Users can view/delete saved reports anytime

## Benefits

- **Time Savings**: Automated research that would take 30+ minutes manually
- **Comprehensive Insights**: Combines multiple data sources
- **Personalized Outreach**: Tailored engagement strategies
- **Knowledge Management**: Centralized research storage
- **Team Collaboration**: Shared research database

## Future Enhancements

Potential improvements:
1. Export research as PDF
2. Email research reports
3. Bulk research generation
4. Research templates
5. Integration with CRM systems
6. Research sharing between team members
7. Automatic research refresh
8. Research analytics/metrics

## Migration Instructions

To deploy this feature:

1. Run the database migration:
```sql
-- Execute the content of backend/supabase_migrations/create_research_table.sql
```

2. Ensure environment variables are set:
- `OPENAI_API_KEY` - For GPT-5 access
- `SUPABASE_URL` - Database URL
- `SUPABASE_SERVICE_ROLE_SECRET` - Database auth

3. Deploy backend and frontend code

4. Test with a prospect that has both LinkedIn URL and email

## Dependencies

- OpenAI API (GPT-5-mini)
- Web scraping (BeautifulSoup4)
- Supabase for storage
- Material-UI for frontend

## Security Considerations

- RLS policies ensure users only see their own research
- Scraped data is not permanently stored (only reports)
- Rate limiting on scraping to avoid blocking
- Sanitization of scraped content before LLM processing

## Performance Notes

- Research generation takes 10-30 seconds typically
- Caching could be added for repeated prospects
- Batch processing possible for multiple prospects

## Support

For issues or questions:
- Check backend logs for scraping errors
- Verify OpenAI API credits available
- Ensure Supabase connection is active
- Check browser console for frontend errors
