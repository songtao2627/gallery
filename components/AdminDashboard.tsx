import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import RibbonBackground from './RibbonBackground';
import AdminTiltCard from './AdminTiltCard';
import { Modal, ModalHeader, StyledInput, StyledTextArea, StyledSelect, StyledActionButtons, TagSelector, IconSelector, ColorSelector, GradientButton, OutlineButton } from './AdminShared';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [session, setSession] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({});

    // Tab State
    const [activeTab, setActiveTab] = useState<'projects' | 'tags'>('projects');

    // Tag State
    const [editingTag, setEditingTag] = useState<{ old: string; new: string } | null>(null);
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagProjects, setNewTagProjects] = useState<string[]>([]);

    // Tag Modal Project Selection State
    const [tagModalProjects, setTagModalProjects] = useState<Project[]>([]);
    const [tagProjectSearch, setTagProjectSearch] = useState('');
    const [isTagProjectLoading, setIsTagProjectLoading] = useState(false);

    // Derived State
    const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);

    // Derived State
    const tagsWithCounts = React.useMemo(() => {
        const counts: { [key: string]: number } = {};
        projects.forEach(p => {
            if (Array.isArray(p.tags)) {
                p.tags.forEach(t => {
                    counts[t] = (counts[t] || 0) + 1;
                });
            }
        });

        // Combine DB tags with counts
        // We use a Map to ensure uniqueness if DB and local derived are out of sync, though DB 'tags' table should be source of truth.
        // For display, we want to show ALL tags from the DB, even if count is 0.
        const tagMap = new Map<string, number>();

        // Initialize with real tags
        allTags.forEach(t => {
            tagMap.set(t.name, 0);
        });

        // Add counts
        Object.entries(counts).forEach(([name, count]) => {
            tagMap.set(name, count);
        });

        // Convert to array and sort
        return Array.from(tagMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }, [projects, allTags]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) navigate('/login');
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) navigate('/login');
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchProjects();
            fetchTags();
        }
    }, [session?.user?.id]);

    const fetchProjects = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            const mappedProjects: Project[] = data.map((p: any) => ({
                ...p,
                projectPath: p.project_path,
                imagePath: p.image_path,
            }));
            setProjects(mappedProjects);
        }
        setLoading(false);
    };

    const fetchTags = async () => {
        const { data, error } = await supabase.from('tags').select('*').order('name');
        if (!error && data) {
            setAllTags(data);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('确定要删除此项目吗？')) return;

        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
            setProjects(projects.filter(p => p.id !== id));
        } else {
            alert('删除项目失败：' + error.message);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucketName: string, metadataKey: string, platform?: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileKey = platform ? `${metadataKey}_${platform}` : metadataKey;
        setUploadingState(prev => ({ ...prev, [fileKey]: true }));

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload directly to the specified bucket
            const { error } = await supabase.storage.from(bucketName).upload(filePath, file, { upsert: true });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);

            // Update editingProject state
            setEditingProject(prev => {
                if(!prev) return prev;
                if (platform) {
                    return {
                        ...prev,
                        metadata: { ...(prev.metadata as any), [platform]: publicUrl }
                    };
                } else {
                    return {
                        ...prev,
                        metadata: { ...(prev.metadata as any), [metadataKey]: publicUrl }
                    };
                }
            });

        } catch (error: any) {
            console.error('Error uploading file:', error.message);
            alert(`上传失败: ${error.message}\n(提示: 请确保在 Supabase Storage 中创建了名为 "${bucketName}" 的公共 Bucket)`);
        } finally {
            setUploadingState(prev => ({ ...prev, [fileKey]: false }));
            e.target.value = '';
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;

        // Auto-create new tags if they don't exist in the 'tags' table
        if (editingProject.tags && editingProject.tags.length > 0) {
            const existingTagNames = new Set(allTags.map(t => t.name));
            const newTagsToAdd = editingProject.tags.filter(t => !existingTagNames.has(t));

            if (newTagsToAdd.length > 0) {
                // Remove duplicates within the new tags themselves
                const uniqueNewTags = [...new Set(newTagsToAdd)];

                const { error: tagError } = await supabase
                    .from('tags')
                    .insert(uniqueNewTags.map(name => ({ name })));

                if (tagError) {
                    console.error('Error auto-creating tags:', tagError);
                    alert('自动创建新标签失败，可以在“标签管理”中手动查看。');
                    // We continue saving the project even if tag creation fails, 
                    // though data integrity might be slightly off (project has tag, but tag table doesn't).
                } else {
                    // Update local state for allTags just in case we continue editing
                    // properly we'd fetchTags(), but let's do that at the end.
                }
            }
        }

        // Convert camelCase back to snake_case for DB
        const dbData = {
            title: editingProject.title,
            description: editingProject.description,
            category: editingProject.category,
            project_path: editingProject.projectPath,
            image_path: editingProject.imagePath,
            tags: editingProject.tags || [],
            color: editingProject.color,
            icon: editingProject.icon,
            project_type: editingProject.project_type || 'website',
            metadata: editingProject.metadata || {}
        };

        let error;
        if (editingProject.id) {
            // Update
            const { error: updateError } = await supabase
                .from('projects')
                .update(dbData)
                .eq('id', editingProject.id);
            error = updateError;
        } else {
            // Create
            const newId = editingProject.title?.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString();
            const { error: insertError } = await supabase
                .from('projects')
                .insert({ ...dbData, id: newId });
            error = insertError;
        }

        if (!error) {
            setIsModalOpen(false);
            setEditingProject(null);
            fetchProjects();
            fetchTags(); // Refresh tags to include any newly auto-created ones
        } else {
            alert('保存项目失败：' + error.message);
        }
    };

    const handleRenameTag = async () => {
        if (!editingTag || !editingTag.new.trim() || editingTag.old === editingTag.new) return;

        if (!window.confirm(`确定将标签 "${editingTag.old}" 重命名为 "${editingTag.new}" 吗？这将更新所有相关项目。`)) return;

        setLoading(true);
        try {
            // 1. Update 'tags' table if the tag exists there
            const tagRecord = allTags.find(t => t.name === editingTag.old);
            if (tagRecord) {
                const { error: tagError } = await supabase
                    .from('tags')
                    .update({ name: editingTag.new })
                    .eq('id', tagRecord.id);

                if (tagError) throw tagError;
            }

            // 2. Update all projects using this tag
            const updates = projects
                .filter(p => p.tags?.includes(editingTag.old))
                .map(p => {
                    const newTags = p.tags.map(t => t === editingTag.old ? editingTag.new : t);
                    const uniqueNewTags = [...new Set(newTags)];
                    return supabase
                        .from('projects')
                        .update({ tags: uniqueNewTags })
                        .eq('id', p.id);
                });

            await Promise.all(updates);
            setEditingTag(null);
            await fetchTags();
            await fetchProjects();
        } catch (e: any) {
            console.error(e);
            alert('重命名标签失败：' + e.message);
        }
        setLoading(false);
    };

    const handleDeleteTag = async (tagToDelete: string) => {
        if (!window.confirm(`确定删除标签 "${tagToDelete}" 吗？这将从所有项目中移除该标签。`)) return;

        setLoading(true);
        try {
            // 1. Delete from 'tags' table
            const { error: tagError } = await supabase
                .from('tags')
                .delete()
                .eq('name', tagToDelete); // Deleting by name is safe since name is unique

            if (tagError) console.error("Error deleting from tags table:", tagError);

            // 2. Remove from all projects
            const updates = projects
                .filter(p => p.tags?.includes(tagToDelete))
                .map(p => {
                    const newTags = p.tags.filter(t => t !== tagToDelete);
                    return supabase
                        .from('projects')
                        .update({ tags: newTags })
                        .eq('id', p.id);
                });

            await Promise.all(updates);
            await fetchTags();
            await fetchProjects();
        } catch (e) {
            console.error(e);
            alert('删除标签失败');
        }
        setLoading(false);
    };

    const handleAddNewTag = async (e: React.FormEvent) => {
        e.preventDefault();
        const infoTagName = newTagName.trim();
        if (!infoTagName) return;

        setLoading(true);
        try {
            // 1. Create in 'tags' table
            // Check if exists first to avoid duplicate error if we don't catch it
            const exists = allTags.some(t => t.name.toLowerCase() === infoTagName.toLowerCase());
            if (exists) {
                alert('标签已存在，请勿重复添加！');
                setLoading(false);
                return;
            }

            const { error: createError } = await supabase
                .from('tags')
                .insert({ name: infoTagName });

            if (createError) throw createError;

            // 2. Assign to selected projects (if any)
            if (newTagProjects.length > 0) {
                const updates = newTagProjects.map(projectId => {
                    const project = projects.find(p => p.id === projectId);
                    if (!project) return Promise.resolve();

                    const currentTags = project.tags || [];
                    // Double check uniqueness
                    if (currentTags.includes(infoTagName)) return Promise.resolve();

                    const updatedTags = [...currentTags, infoTagName];
                    return supabase
                        .from('projects')
                        .update({ tags: updatedTags })
                        .eq('id', projectId);
                });
                await Promise.all(updates);
            }

            setIsAddTagModalOpen(false);
            setNewTagName('');
            setNewTagProjects([]);

            await fetchTags();
            await fetchProjects();

        } catch (error: any) {
            alert('添加标签失败：' + error.message);
        }
        setLoading(false);
    };

    const toggleProjectForNewTag = (projectId: string) => {
        setNewTagProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    // --- Tag Modal Project Fetching Logic ---

    // Fetch projects for the tag modal (Recent 10 or Search results)
    const fetchTagModalProjects = async (search: string = '') => {
        setIsTagProjectLoading(true);
        let query = supabase.from('projects').select('*');

        if (search.trim()) {
            query = query.ilike('title', `%${search.trim()}%`).order('created_at', { ascending: false }).limit(20);
        } else {
            // Default: Top 10 recent
            query = query.order('created_at', { ascending: false }).limit(10);
        }

        const { data, error } = await query;

        if (!error && data) {
            const mappedProjects: Project[] = data.map((p: any) => ({
                ...p,
                projectPath: p.project_path,
                imagePath: p.image_path,
            }));
            setTagModalProjects(mappedProjects);
        }
        setIsTagProjectLoading(false);
    };

    // Initial fetch when modal opens
    useEffect(() => {
        if (isAddTagModalOpen) {
            setTagProjectSearch('');
            fetchTagModalProjects('');
        }
    }, [isAddTagModalOpen]);

    // Debounced search effect
    useEffect(() => {
        if (!isAddTagModalOpen) return;

        const timer = setTimeout(() => {
            fetchTagModalProjects(tagProjectSearch);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [tagProjectSearch]);

    const openEdit = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingProject({
            title: '',
            description: '',
            category: 'Work',
            projectPath: '/',
            imagePath: '',
            tags: ['NEW'],
            color: 'text-blue-500',
            icon: 'star',
            project_type: 'website',
            metadata: {}
        });
        setIsModalOpen(true);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    }

    return (
        <div className="min-h-screen w-full font-body relative overflow-x-hidden selection:bg-pink-500 selection:text-white">

            {/* Background Layer */}
            <RibbonBackground initialThemeId="cyber" />

            {loading ? (
                <div className="min-h-screen flex items-center justify-center font-display text-2xl tracking-widest animate-pulse text-[var(--theme-title)]">
                    LOADING...
                </div>
            ) : (
                <>


                    {/* Content Layer */}
                    <div className="relative z-10 container mx-auto px-4 py-8 md:px-8 max-w-7xl">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-in slide-in-from-top-10 duration-700 fade-in">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="h-[2px] w-8 bg-blue-500"></span>
                                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Administration</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm tracking-tight">
                                    Project <span className="italic text-blue-500">Dashboard</span>
                                </h1>
                            </div>

                            <div className="flex gap-4">
                                <OutlineButton
                                    label="查看站点"
                                    icon="public"
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 border-[var(--theme-text)] text-[var(--theme-text)] hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                />
                                <OutlineButton
                                    label="退出登录"
                                    icon="logout"
                                    onClick={handleLogout}
                                    className="px-6 py-3 border-red-500 text-red-500 hover:bg-red-500/10 hover:shadow-red-500/30"
                                />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-8 mb-8 border-b border-white/10 pb-1">
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`pb-4 px-2 text-lg font-bold transition-all relative ${activeTab === 'projects' ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                项目列表
                                {activeTab === 'projects' && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-t-full layout-id-tab"></span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('tags')}
                                className={`pb-4 px-2 text-lg font-bold transition-all relative ${activeTab === 'tags' ? 'text-green-400' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                标签管理
                                {activeTab === 'tags' && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-green-500 rounded-t-full layout-id-tab"></span>
                                )}
                            </button>
                        </div>

                        {/* Projects Tab */}
                        {activeTab === 'projects' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-end">
                                    <GradientButton
                                        label="新建项目"
                                        icon="add_circle"
                                        onClick={openNew}
                                        className="px-8 py-3"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {projects.map((project, i) => (
                                        <div
                                            key={project.id}
                                            className="h-[400px] animate-in fade-in slide-in-from-bottom-10 fill-mode-backwards"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <AdminTiltCard
                                                project={project}
                                                onEdit={openEdit}
                                                onDelete={handleDelete}
                                            />
                                        </div>
                                    ))}

                                    {/* Add New Card Placeholder */}
                                    <div
                                        onClick={openNew}
                                        className="h-[400px] rounded-[2rem] border-2 border-dashed border-white/10 hover:border-blue-500/50 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center cursor-pointer transition-all group animate-in fade-in slide-in-from-bottom-10"
                                        style={{ animationDelay: `${projects.length * 100}ms` }}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500 transition-all">
                                            <span className="material-symbols-rounded text-3xl text-slate-400 group-hover:text-white">add</span>
                                        </div>
                                        <span className="font-bold text-slate-400 group-hover:text-white tracking-widest uppercase text-sm">点击新建项目</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tags Tab */}
                        {activeTab === 'tags' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative overflow-hidden bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                    {/* Decorative Background Elements */}
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                                    {/* Header Controls Only */}
                                    <div className="relative flex justify-end items-center mb-6 gap-4 z-10">
                                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 text-xs font-bold backdrop-blur-md">
                                            {tagsWithCounts.length} TAGS
                                        </div>
                                        <GradientButton
                                            label="新建标签"
                                            icon="add_circle"
                                            onClick={() => setIsAddTagModalOpen(true)}
                                            className="px-6 py-2 text-sm"
                                        />
                                    </div>

                                    {/* Compact Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {tagsWithCounts.map(({ name: tag, count }, i) => {
                                            // Compact color themes
                                            const themes = [
                                                { from: 'from-blue-500/10', to: 'to-cyan-500/10', text: 'text-blue-400', border: 'group-hover:border-blue-500/30' },
                                                { from: 'from-purple-500/10', to: 'to-pink-500/10', text: 'text-purple-400', border: 'group-hover:border-purple-500/30' },
                                                { from: 'from-emerald-500/10', to: 'to-teal-500/10', text: 'text-emerald-400', border: 'group-hover:border-emerald-500/30' },
                                                { from: 'from-amber-500/10', to: 'to-orange-500/10', text: 'text-amber-400', border: 'group-hover:border-amber-500/30' },
                                                { from: 'from-rose-500/10', to: 'to-red-500/10', text: 'text-rose-400', border: 'group-hover:border-rose-500/30' },
                                            ];
                                            const theme = themes[i % themes.length];

                                            return (
                                                <div
                                                    key={tag}
                                                    className={`group relative flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-md border border-white/5 ${theme.border} rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden`}
                                                >
                                                    {/* Subtle Background Gradient */}
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.from} ${theme.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

                                                    <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                                                        {/* Icon Badge */}
                                                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 flex-none`}>
                                                            <span className={`material-symbols-rounded text-lg ${theme.text}`}>label</span>
                                                        </div>

                                                        {/* Tag Name & Edit Input */}
                                                        <div className="flex-1 min-w-0">
                                                            {editingTag?.old === tag ? (
                                                                <div className="flex items-center gap-1">
                                                                    <input
                                                                        autoFocus
                                                                        className="w-full bg-black/50 border border-blue-500/50 rounded px-1.5 py-0.5 text-white text-xs focus:outline-none"
                                                                        value={editingTag.new}
                                                                        onChange={e => setEditingTag({ ...editingTag, new: e.target.value })}
                                                                        onKeyDown={e => {
                                                                            if (e.key === 'Enter') handleRenameTag();
                                                                            if (e.key === 'Escape') setEditingTag(null);
                                                                        }}
                                                                        onClick={e => e.stopPropagation()}
                                                                    />
                                                                    <button onClick={(e) => { e.stopPropagation(); handleRenameTag(); }} className="text-green-400 hover:text-green-300"><span className="material-symbols-rounded text-base">check</span></button>
                                                                    <button onClick={(e) => { e.stopPropagation(); setEditingTag(null); }} className="text-red-400 hover:text-red-300"><span className="material-symbols-rounded text-base">close</span></button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col">
                                                                    <div className="font-bold text-slate-200 text-sm truncate" title={tag}>{tag}</div>
                                                                    <div className="text-[10px] text-slate-500 font-mono">{count} PROJS</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Hover Actions */}
                                                    {!editingTag && (
                                                        <div className="relative z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-center pl-2 border-l border-white/5 ml-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setEditingTag({ old: tag, new: tag }); }}
                                                                className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors"
                                                                title="重命名"
                                                            >
                                                                <span className="material-symbols-rounded text-base">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag); }}
                                                                className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                                                                title="删除"
                                                            >
                                                                <span className="material-symbols-rounded text-base">delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Project Modal */}
                    <Modal isOpen={isModalOpen && !!editingProject} onClose={() => setIsModalOpen(false)}>
                        {editingProject && (
                            <>
                                <ModalHeader
                                    title={editingProject.id ? '编辑项目' : '新建项目'}
                                    subtitle={
                                        <>
                                            DESIGNSTUDIO <span className="mx-2 text-slate-600">•</span> CONTROLLER
                                        </>
                                    }
                                    icon={editingProject.id ? 'edit_square' : 'add_circle'}
                                    onClose={() => setIsModalOpen(false)}
                                />

                                {/* Split Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 overflow-hidden bg-transparent">
                                    {/* Left Column - Form */}
                                    <div className="h-full overflow-y-auto custom-scrollbar p-8">
                                        <form onSubmit={handleSave} className="space-y-6">

                                            {/* Primary Info Group */}
                                            <div className="space-y-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                                                <StyledInput
                                                    label="项目标题"
                                                    value={editingProject.title || ''}
                                                    onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                                                    placeholder="请输入项目名称"
                                                    required
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <StyledSelect
                                                        label="所属分类"
                                                        value={editingProject.category || 'Work'}
                                                        onChange={e => setEditingProject({ ...editingProject, category: e.target.value as any })}
                                                        options={[
                                                            { value: 'Work', label: 'Work' },
                                                            { value: 'Life', label: 'Life' },
                                                            { value: 'Learning', label: 'Learning' },
                                                            { value: 'IT', label: 'IT' },
                                                        ]}
                                                    />

                                                    <StyledSelect
                                                        label="作品类型"
                                                        value={editingProject.project_type || 'website'}
                                                        onChange={e => setEditingProject({ ...editingProject, project_type: e.target.value as any })}
                                                        options={[
                                                            { value: 'website', label: '网站 (Website)' },
                                                            { value: 'software', label: '软件 (Software)' },
                                                            { value: 'drawio', label: '图纸 (Drawio)' },
                                                        ]}
                                                    />

                                                    <IconSelector
                                                        label="图标"
                                                        value={editingProject.icon || ''}
                                                        onChange={icon => setEditingProject({ ...editingProject, icon })}
                                                    />
                                                </div>

                                                <ColorSelector
                                                    label="主题色"
                                                    value={editingProject.color || 'text-slate-400'}
                                                    onChange={color => setEditingProject({ ...editingProject, color })}
                                                />

                                                <StyledTextArea
                                                    label="项目描述"
                                                    value={editingProject.description || ''}
                                                    onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                                                    placeholder="请输入项目描述..."
                                                />
                                            </div>

                                            {/* Media & Resources Group */}
                                            <div className="space-y-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                                                <StyledInput
                                                    label="封面图片 URL"
                                                    icon="image"
                                                    value={editingProject.imagePath || ''}
                                                    onChange={e => setEditingProject({ ...editingProject, imagePath: e.target.value })}
                                                    placeholder="https://..."
                                                    className="font-mono text-sm"
                                                />

                                                <StyledInput
                                                    label="项目路径 / 链接 (常用于外链)"
                                                    icon="link"
                                                    value={editingProject.projectPath || ''}
                                                    onChange={e => setEditingProject({ ...editingProject, projectPath: e.target.value })}
                                                    placeholder="/project-path"
                                                    className="font-mono text-sm"
                                                />

                                                {editingProject.project_type === 'drawio' && (
                                                    <div className="pt-4 border-t border-white/10">
                                                        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                                                            <span className="font-bold flex items-center gap-1 mb-1"><span className="material-symbols-rounded text-sm">info</span>自动加速通道</span>
                                                            您可以直接粘贴 Supabase 存储的原生外链 (lcrpvoothmyyqzzzmrir.supabase.co)。前台向用户展示时，系统会自动将它重写为自带的 <code className="bg-black/30 px-1 py-0.5 rounded text-pink-300">/storage/</code> 国内镜像加速地址。
                                                        </div>
                                                        <div className="flex gap-2 items-end">
                                                            <div className="flex-1">
                                                                <StyledInput
                                                                    label="Drawio 源文件链接 (XML)"
                                                                    icon="account_tree"
                                                                    value={(editingProject.metadata as any)?.fileUrl || ''}
                                                                    onChange={e => setEditingProject({ ...editingProject, metadata: { ...(editingProject.metadata as any), fileUrl: e.target.value } })}
                                                                    placeholder="https://..."
                                                                    className="font-mono text-sm"
                                                                />
                                                            </div>
                                                            <label title="直接上传源文件到 Supabase" className="relative flex items-center justify-center px-4 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors cursor-pointer group mt-6">
                                                                {uploadingState['fileUrl'] ? (
                                                                    <span className="material-symbols-rounded animate-spin">refresh</span>
                                                                ) : (
                                                                    <>
                                                                        <span className="material-symbols-rounded text-lg mr-1 group-hover:-translate-y-1 transition-transform">cloud_upload</span>
                                                                        <span className="text-sm font-bold whitespace-nowrap">云上传</span>
                                                                    </>
                                                                )}
                                                                <input type="file" className="hidden" disabled={uploadingState['fileUrl']} onChange={(e) => handleFileUpload(e, 'drawio', 'fileUrl')} accept=".xml,.drawio,.svg" />
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}

                                                {editingProject.project_type === 'software' && (
                                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                                        <h4 className="text-white text-sm font-bold opacity-70 mb-2 tracking-widest uppercase flex items-center gap-2">
                                                            <span className="material-symbols-rounded text-sm">deployed_code</span>
                                                            软件发布设置
                                                        </h4>
                                                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                                                            <span className="font-bold flex items-center gap-1 mb-1"><span className="material-symbols-rounded text-sm">info</span>自动加速通道</span>
                                                            您可以直接粘贴 Supabase 存储的原生下载链接。前台对外下载时，系统会自动将它重写借道由于 Caddy 转发的 <code className="bg-black/30 px-1 py-0.5 rounded text-pink-300">/storage/</code> 国内镜像地址。如果是第三方网盘（如七牛、阿里 OSS 等），则会保留直链原样跳转。
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <StyledInput
                                                                label="最新版本 (例如: v1.0.3)"
                                                                icon="tag"
                                                                value={(editingProject.metadata as any)?.latestVersion || ''}
                                                                onChange={e => setEditingProject({ ...editingProject, metadata: { ...(editingProject.metadata as any), latestVersion: e.target.value } })}
                                                                placeholder="v1.0.0"
                                                                className="font-mono text-sm"
                                                            />
                                                            <StyledInput
                                                                label="代码仓库"
                                                                icon="code"
                                                                value={(editingProject.metadata as any)?.repoUrl || ''}
                                                                onChange={e => setEditingProject({ ...editingProject, metadata: { ...(editingProject.metadata as any), repoUrl: e.target.value } })}
                                                                placeholder="https://github.com/..."
                                                                className="font-mono text-sm"
                                                            />
                                                        </div>

                                                        <div className="flex gap-2 items-end">
                                                            <div className="flex-1">
                                                                <StyledInput
                                                                    label="Windows 下载链接"
                                                                    icon="desktop_windows"
                                                                    value={(editingProject.metadata as any)?.windows || ''}
                                                                    onChange={e => setEditingProject({ ...editingProject, metadata: { ...(editingProject.metadata as any), windows: e.target.value } })}
                                                                    placeholder="https://..."
                                                                    className="font-mono text-sm"
                                                                />
                                                            </div>
                                                            <label title="上传安装包" className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors cursor-pointer group">
                                                                {uploadingState['metadata_windows'] ? (
                                                                    <span className="material-symbols-rounded animate-spin">refresh</span>
                                                                ) : (
                                                                    <span className="material-symbols-rounded text-lg group-hover:-translate-y-1 transition-transform">cloud_upload</span>
                                                                )}
                                                                <input type="file" className="hidden" disabled={uploadingState['metadata_windows']} onChange={(e) => handleFileUpload(e, 'software_assets', 'metadata', 'windows')} />
                                                            </label>
                                                        </div>

                                                        <div className="flex gap-2 items-end">
                                                            <div className="flex-1">
                                                                <StyledInput
                                                                    label="MacOS 下载链接"
                                                                    icon="desktop_mac"
                                                                    value={(editingProject.metadata as any)?.macos || ''}
                                                                    onChange={e => setEditingProject({ ...editingProject, metadata: { ...(editingProject.metadata as any), macos: e.target.value } })}
                                                                    placeholder="https://..."
                                                                    className="font-mono text-sm"
                                                                />
                                                            </div>
                                                            <label title="上传安装包" className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors cursor-pointer group">
                                                                {uploadingState['metadata_macos'] ? (
                                                                    <span className="material-symbols-rounded animate-spin">refresh</span>
                                                                ) : (
                                                                    <span className="material-symbols-rounded text-lg group-hover:-translate-y-1 transition-transform">cloud_upload</span>
                                                                )}
                                                                <input type="file" className="hidden" disabled={uploadingState['metadata_macos']} onChange={(e) => handleFileUpload(e, 'software_assets', 'metadata', 'macos')} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tags Group */}
                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                                <TagSelector
                                                    label="项目标签"
                                                    selectedTags={editingProject.tags || []}
                                                    availableTags={allTags.map(t => t.name)}
                                                    onChange={(newTags) => setEditingProject({ ...editingProject, tags: newTags })}
                                                />
                                            </div>

                                            <StyledActionButtons
                                                onCancel={() => setIsModalOpen(false)}
                                                submitLabel="保存项目"
                                                submitIcon="save"
                                            />
                                        </form>
                                    </div>

                                    {/* Right Column - Live Preview */}
                                    <div className="hidden lg:flex flex-col items-center justify-center p-10 bg-black/40 border-l border-white/5 relative overflow-hidden group/preview h-full">
                                        {/* Dynamic Grid Background */}
                                        <div className="absolute inset-0 opacity-10"
                                            style={{
                                                backgroundImage: 'radial-gradient(circle at 1px 1px, var(--theme-title) 1px, transparent 0)',
                                                backgroundSize: '32px 32px'
                                            }}
                                        ></div>

                                        <div className="relative z-10 w-full max-w-[380px]">
                                            <div className="flex items-center justify-center gap-2 mb-8 opacity-50 text-[var(--theme-title)]">
                                                <span className="material-symbols-rounded animate-pulse">visibility</span>
                                                <span className="text-xs font-bold tracking-[0.3em]">实时预览 LIVE PREVIEW</span>
                                            </div>

                                            <div className="w-full aspect-[3/4] transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
                                                <AdminTiltCard
                                                    project={{
                                                        id: editingProject.id || 'preview-id',
                                                        title: editingProject.title || 'Project Title',
                                                        description: editingProject.description || 'Your project description will appear here in real-time...',
                                                        category: editingProject.category || 'Work',
                                                        projectPath: editingProject.projectPath || '/',
                                                        imagePath: editingProject.imagePath || '',
                                                        tags: editingProject.tags || [],
                                                        color: editingProject.color || 'text-blue-500',
                                                        icon: editingProject.icon || 'star'
                                                    }}
                                                    onEdit={() => { }}
                                                    onDelete={() => { }}
                                                    showActions={false}
                                                />
                                            </div>

                                            <div className="mt-8 text-center">
                                                <p className="text-slate-500 text-xs italic">
                                                    "用户视角的卡片效果"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </Modal>

                    {/* Add Tag Modal */}
                    <Modal isOpen={isAddTagModalOpen} onClose={() => setIsAddTagModalOpen(false)} maxWidthClass="max-w-xl">
                        <ModalHeader
                            title="新建标签"
                            subtitle={
                                <>
                                    METADATA <span className="mx-2 text-slate-600">•</span> CLASSIFICATION
                                </>
                            }
                            icon="label"
                            onClose={() => setIsAddTagModalOpen(false)}
                        />

                        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleAddNewTag} className="space-y-6">
                                <div className="space-y-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                                    <StyledInput
                                        label="标签名称"
                                        value={newTagName}
                                        onChange={e => setNewTagName(e.target.value)}
                                        placeholder="例如: Featured"
                                        autoFocus
                                    />

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">关联项目 <span className="text-[var(--theme-title)] opacity-70 normal-case ml-1 font-normal tracking-normal">(可选)</span></label>
                                            <span className="text-xs font-bold" style={{ color: 'var(--theme-title)' }}>{newTagProjects.length} 已选</span>
                                        </div>

                                        {/* Search Input for Projects */}
                                        <div className="relative mb-2">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-rounded text-lg pointer-events-none">search</span>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[var(--theme-title)] focus:ring-1 focus:ring-[var(--theme-title)] transition-all"
                                                placeholder="搜索项目..."
                                                value={tagProjectSearch}
                                                onChange={(e) => setTagProjectSearch(e.target.value)}
                                            />
                                        </div>

                                        <div className="h-48 overflow-y-auto custom-scrollbar border border-white/10 rounded-xl bg-black/20 p-2 relative">
                                            {isTagProjectLoading && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                                    <span className="material-symbols-rounded animate-spin text-blue-500">sync</span>
                                                </div>
                                            )}

                                            {tagModalProjects.length === 0 && !isTagProjectLoading ? (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                                                    <span className="material-symbols-rounded text-2xl">search_off</span>
                                                    <span className="text-xs">未找到匹配项目</span>
                                                </div>
                                            ) : (
                                                tagModalProjects.map(project => (
                                                    <div
                                                        key={project.id}
                                                        onClick={() => toggleProjectForNewTag(project.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${newTagProjects.includes(project.id)
                                                            ? 'bg-white/10 border border-white/20'
                                                            : 'hover:bg-white/5 border border-transparent'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all flex-none ${newTagProjects.includes(project.id)
                                                                ? 'border-[var(--theme-title)]'
                                                                : 'border-slate-600'
                                                                }`}
                                                            style={newTagProjects.includes(project.id) ? { backgroundColor: 'var(--theme-title)' } : {}}
                                                        >
                                                            {newTagProjects.includes(project.id) && (
                                                                <span className="material-symbols-rounded text-xs text-black font-bold">check</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-sm font-medium truncate ${newTagProjects.includes(project.id) ? 'text-white' : 'text-slate-400'
                                                                }`}>
                                                                {project.title}
                                                            </div>
                                                            <div className="text-[10px] text-slate-600 truncate">{project.id}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <StyledActionButtons
                                    onCancel={() => setIsAddTagModalOpen(false)}
                                    submitLabel="创建标签"
                                    submitIcon="add_circle"
                                    isSubmitDisabled={!newTagName.trim()}
                                />
                            </form>
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
};


export default AdminDashboard;
