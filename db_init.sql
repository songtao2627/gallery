-- 1. Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow public read access
CREATE POLICY "Public read access" ON tags FOR SELECT USING (true);

-- Allow authenticated users to manage tags
CREATE POLICY "Authenticated users can insert" ON tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update" ON tags FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete" ON tags FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Migrate existing tags from projects table
-- This extracts all unique tags currently used in projects and inserts them into the new tags table
INSERT INTO tags (name)
SELECT DISTINCT unnest(tags)
FROM projects
ON CONFLICT (name) DO NOTHING;
