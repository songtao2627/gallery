-- Update existing `projects` table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'website';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create `software_releases` table
CREATE TABLE IF NOT EXISTS public.software_releases (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id text REFERENCES public.projects(id) ON DELETE CASCADE,
    version text NOT NULL,
    changelog text,
    download_urls jsonb DEFAULT '{}'::jsonb,
    released_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- (Optional) Example data update:
-- UPDATE public.projects SET project_type = 'website';
