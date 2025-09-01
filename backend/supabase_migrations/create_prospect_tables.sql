-- Create saved_prospects table for storing individual contacts
CREATE TABLE IF NOT EXISTS saved_prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    title TEXT,
    company TEXT,
    linkedin_url TEXT,
    phone TEXT,
    prospect_data JSONB NOT NULL, -- Store full Apollo response data
    notes TEXT,
    tags TEXT[], -- Array of tags for organization
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'contacted', 'qualified', 'closed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_companies table for storing organization prospects
CREATE TABLE IF NOT EXISTS saved_companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    website_url TEXT,
    linkedin_url TEXT,
    domain TEXT,
    founded_year INTEGER,
    employee_count TEXT,
    prospect_data JSONB NOT NULL, -- Store full Apollo response data
    notes TEXT,
    tags TEXT[], -- Array of tags for organization
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'researching', 'qualified', 'closed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prospect_research_notes table for detailed research tracking
CREATE TABLE IF NOT EXISTS prospect_research_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prospect_id UUID, -- Can reference either saved_prospects or saved_companies
    prospect_type TEXT NOT NULL CHECK (prospect_type IN ('person', 'company')),
    note_title TEXT NOT NULL,
    note_content TEXT NOT NULL,
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'meeting', 'call', 'email', 'follow_up', 'research')),
    due_date TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_prospects_user_id ON saved_prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_prospects_status ON saved_prospects(status);
CREATE INDEX IF NOT EXISTS idx_saved_prospects_created_at ON saved_prospects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_companies_user_id ON saved_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_companies_status ON saved_companies(status);
CREATE INDEX IF NOT EXISTS idx_saved_companies_created_at ON saved_companies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prospect_research_notes_user_id ON prospect_research_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_prospect_research_notes_prospect ON prospect_research_notes(prospect_id, prospect_type);
CREATE INDEX IF NOT EXISTS idx_prospect_research_notes_due_date ON prospect_research_notes(due_date);

-- Create triggers for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_prospects_updated_at
    BEFORE UPDATE ON saved_prospects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_companies_updated_at
    BEFORE UPDATE ON saved_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospect_research_notes_updated_at
    BEFORE UPDATE ON prospect_research_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE saved_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_research_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only access their own data
CREATE POLICY "Users can view their own saved prospects" ON saved_prospects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved prospects" ON saved_prospects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved prospects" ON saved_prospects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved prospects" ON saved_prospects
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own saved companies" ON saved_companies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved companies" ON saved_companies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved companies" ON saved_companies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved companies" ON saved_companies
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own research notes" ON prospect_research_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research notes" ON prospect_research_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research notes" ON prospect_research_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research notes" ON prospect_research_notes
    FOR DELETE USING (auth.uid() = user_id);
