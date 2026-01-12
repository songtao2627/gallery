const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to load env file
function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    console.log(`Loading env from ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...vals] = trimmed.split('=');
            if (key) {
                let val = vals.join('=');
                // Remove quotes if present
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                env[key.trim()] = val.trim();
            }
        }
    });
    return env;
}

// Try loading .env.local first, then .env
let env = loadEnv(path.resolve(__dirname, '../.env.local'));
if (!env.VITE_SUPABASE_URL) {
    env = { ...env, ...loadEnv(path.resolve(__dirname, '../.env')) };
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Could not find VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env or .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function backup() {
    console.log('Starting backup...');

    // 1. Fetch Data
    const { data: projects, error: pErr } = await supabase.from('projects').select('*').order('created_at', { ascending: true });
    if (pErr) console.error('Error fetching projects:', pErr.message);
    else console.log(`Fethed ${projects.length} projects`);

    const { data: tags, error: tErr } = await supabase.from('tags').select('*').order('created_at', { ascending: true });
    if (tErr) console.error('Error fetching tags:', tErr.message);
    else console.log(`Fethed ${tags.length} tags`);

    // 2. Generate SQL
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let sql = `-- Database Backup\n-- Generated: ${new Date().toISOString()}\n\n`;

    // Schema: Projects
    sql += `-- Table Structure: projects\n`;
    sql += `CREATE TABLE IF NOT EXISTS public.projects (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    project_path text NOT NULL,
    image_path text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    color text,
    icon text,
    created_at timestamptz DEFAULT now()
);\n\n`;

    // Schema: Tags
    sql += `-- Table Structure: tags\n`;
    sql += `CREATE TABLE IF NOT EXISTS public.tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);\n\n`;

    // Data: Projects
    if (projects && projects.length > 0) {
        sql += `-- Data: projects\n`;
        sql += `INSERT INTO public.projects (id, title, description, category, project_path, image_path, tags, color, icon, created_at) VALUES\n`;
        const projectRows = projects.map(p => {
            const clean = (str) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
            const tagsArr = p.tags && Array.isArray(p.tags)
                ? `ARRAY[${p.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',')}]`
                : "'{}'";

            return `(${clean(p.id)}, ${clean(p.title)}, ${clean(p.description)}, ${clean(p.category)}, ${clean(p.project_path)}, ${clean(p.image_path)}, ${tagsArr}, ${clean(p.color)}, ${clean(p.icon)}, ${clean(p.created_at)})`;
        });
        sql += projectRows.join(',\n') + ';\n\n';
    }

    // Data: Tags
    if (tags && tags.length > 0) {
        sql += `-- Data: tags\n`;
        sql += `INSERT INTO public.tags (id, name, created_at) VALUES\n`;
        const tagRows = tags.map(t => {
            const clean = (str) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
            return `(${clean(t.id)}, ${clean(t.name)}, ${clean(t.created_at)})`;
        });
        sql += tagRows.join(',\n') + ' ON CONFLICT (id) DO NOTHING;\n\n';
    }

    const filename = `db_init_${dateStr}.sql`;
    const outputPath = path.resolve(__dirname, '../', filename);

    fs.writeFileSync(outputPath, sql);
    console.log(`\nBackup successful! File saved to: ${filename}`);
}

backup().catch(console.error);
