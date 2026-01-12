-- Database Backup
-- Generated: 2026-01-12T13:38:33.816Z

-- Table Structure: projects
CREATE TABLE IF NOT EXISTS public.projects (
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
);

-- Table Structure: tags
CREATE TABLE IF NOT EXISTS public.tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Data: projects
INSERT INTO public.projects (id, title, description, category, project_path, image_path, tags, color, icon, created_at) VALUES
('w3', 'TimeMaster', 'AI 驱动的智能日程安排与效率助手。', 'Work', '/timemaster/', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop', ARRAY['效率','时间管理'], 'text-sky-500', 'calendar_month', '2026-01-10T03:14:22.237644+00:00'),
('w4', 'FinTrack', '极简主义风格的发票与企业支出追踪工具。', 'Work', '/fintrack/', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop', ARRAY['金融','财务'], 'text-blue-500', 'finance', '2026-01-10T03:14:22.237644+00:00'),
('l1', 'ZenMind', '结合空间音频技术的冥想与助眠应用。', 'Life', '/zenmind/', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=800&auto=format&fit=crop', ARRAY['健康','冥想'], 'text-emerald-500', 'self_improvement', '2026-01-10T03:14:22.237644+00:00'),
('l2', 'RhythmStream', '高保真无损音乐流媒体播放界面。', 'Life', '/rhythmstream/', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop', ARRAY['音乐','娱乐'], 'text-teal-500', 'music_note', '2026-01-10T03:14:22.237644+00:00'),
('l3', 'Chef''s Table', '全球精选食谱探索与个性化膳食计划。', 'Life', '/chefstable/', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop', ARRAY['美食','生活方式'], 'text-lime-600', 'restaurant', '2026-01-10T03:14:22.237644+00:00'),
('le1', 'LingoMax', '沉浸式游戏化语言学习平台。', 'Learning', '/lingomax/', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop', ARRAY['语言','教育'], 'text-teal-600', 'language', '2026-01-10T03:14:22.237644+00:00'),
('le2', 'AtomLab', '交互式元素周期表与化学实验模拟。', 'Learning', '/atomlab/', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop', ARRAY['科学','STEM'], 'text-cyan-600', 'science', '2026-01-10T03:14:22.237644+00:00'),
('le3', 'Chronos', '3D 交互式世界历史时间轴。', 'Learning', '/chronos/', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop', ARRAY['历史','3D'], 'text-emerald-600', 'history_edu', '2026-01-10T03:14:22.237644+00:00'),
('it1', 'AlgoMaster', '实时算法可视化演示与学习工具。', 'IT', '/algomaster/', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop', ARRAY['代码','计算机科学'], 'text-amber-500', 'code', '2026-01-10T03:14:22.237644+00:00'),
('it2', 'SysDesign Pro', '系统设计面试专用的架构绘图工具。', 'IT', '/sysdesign/', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop', ARRAY['架构','系统设计'], 'text-yellow-600', 'architecture', '2026-01-10T03:14:22.237644+00:00'),
('it3', 'InterviewBot', '提供实时反馈的 AI 模拟面试官。', 'IT', '/interviewbot/', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop', ARRAY['AI','职业发展'], 'text-orange-400', 'video_chat', '2026-01-10T03:14:22.237644+00:00'),
('w1', 'DataFlow Pro', '这是面向企业数据流的可视化分析仪表盘。', 'Work', '/dataflow-pro/', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop', ARRAY['商业','分析'], 'text-cyan-600', 'analytics', '2026-01-10T03:14:22.237644+00:00'),
('w2', 'CollabSpace', '专为远程创意团队设计的实时协作白板。', 'Work', '/collabspace/', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop', ARRAY['协作','团队','效率'], 'text-cyan-500', 'groups', '2026-01-10T03:14:22.237644+00:00');

-- Data: tags
INSERT INTO public.tags (id, name, created_at) VALUES
('528d24ad-63f6-4336-8347-434b964590ea', '语言', '2026-01-10T12:19:45.50466+00:00'),
('63c6c5e2-aef9-4038-a1f8-d7f920609371', '团队', '2026-01-10T12:19:45.50466+00:00'),
('aa8e8773-4672-4c3a-8881-9eb583e64f51', '商业', '2026-01-10T12:19:45.50466+00:00'),
('85d1e034-1447-4d66-9044-44d3ee92035e', 'AI', '2026-01-10T12:19:45.50466+00:00'),
('73445e7c-3eb3-4b5a-b9c7-453c907583ca', '架构', '2026-01-10T12:19:45.50466+00:00'),
('8b026f5e-1ac1-4535-ac94-e7155a919795', '财务', '2026-01-10T12:19:45.50466+00:00'),
('e76936c0-3629-4ef9-b39d-7a553d08ed3f', '科学', '2026-01-10T12:19:45.50466+00:00'),
('1158902f-1275-4c03-8ba7-ce81d0e62f0b', '教育', '2026-01-10T12:19:45.50466+00:00'),
('2b1160f9-0355-42fd-bde2-bf61c45d2088', '健康', '2026-01-10T12:19:45.50466+00:00'),
('9ed0bb18-5a95-44b7-a6ca-6a402cdcfd78', '职业发展', '2026-01-10T12:19:45.50466+00:00'),
('360ef66f-ab54-40cd-9ea1-17219992794b', '金融', '2026-01-10T12:19:45.50466+00:00'),
('bcd3751e-6040-44ec-b9c2-6f43ce70bf71', '计算机科学', '2026-01-10T12:19:45.50466+00:00'),
('84613279-908d-4f02-bf10-4d043d068d21', '时间管理', '2026-01-10T12:19:45.50466+00:00'),
('aecf20be-3675-4e4d-b81a-4bced859ba52', '系统设计', '2026-01-10T12:19:45.50466+00:00'),
('cbdea5fc-ac4e-4feb-ac19-ba774d393e8f', '分析', '2026-01-10T12:19:45.50466+00:00'),
('ec740bb7-9938-4e05-96a6-84acda914a30', '3D', '2026-01-10T12:19:45.50466+00:00'),
('9096055a-4ffc-4989-b10b-22a534049a4b', '代码', '2026-01-10T12:19:45.50466+00:00'),
('6562585a-02b2-4b61-93be-9fd664de48c8', '历史', '2026-01-10T12:19:45.50466+00:00'),
('ba579d9f-480c-450a-873d-c2f990bc486a', '效率', '2026-01-10T12:19:45.50466+00:00'),
('cfc3a0e2-7c65-47f7-abc1-9db966649dfe', '音乐', '2026-01-10T12:19:45.50466+00:00'),
('5df75e85-f54f-4700-91f7-53de7bfe0d96', '冥想', '2026-01-10T12:19:45.50466+00:00'),
('d7379d0d-b69f-4f2a-9dd4-2d8898f2f305', '美食', '2026-01-10T12:19:45.50466+00:00'),
('5f11a1a0-1753-48f2-89a8-a90a0e6272cf', '协作', '2026-01-10T12:19:45.50466+00:00'),
('1d5c3be1-cd68-4937-b8f6-f5cf0b2c3e26', '生活方式', '2026-01-10T12:19:45.50466+00:00'),
('a770a509-b3da-4647-8172-cae9c261bcbf', 'STEM', '2026-01-10T12:19:45.50466+00:00'),
('998c40f8-7343-4e13-b326-bfccf444178f', '娱乐', '2026-01-10T12:19:45.50466+00:00') ON CONFLICT (id) DO NOTHING;

