-- Create table for storing prospect research reports
CREATE TABLE IF NOT EXISTS prospect_research (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_id TEXT NOT NULL,
  prospect_name TEXT,
  prospect_email TEXT,
  prospect_title TEXT,
  company_name TEXT,
  linkedin_url TEXT,
  company_website TEXT,
  research_report JSONB,
  research_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prospect_research_user_id ON prospect_research(user_id);
CREATE INDEX IF NOT EXISTS idx_prospect_research_created_at ON prospect_research(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospect_research_prospect_name ON prospect_research(prospect_name);
CREATE INDEX IF NOT EXISTS idx_prospect_research_company_name ON prospect_research(company_name);

-- Enable Row Level Security
ALTER TABLE prospect_research ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own research" ON prospect_research
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own research" ON prospect_research
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research" ON prospect_research
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research" ON prospect_research
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_prospect_research_updated_at BEFORE UPDATE ON prospect_research
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
