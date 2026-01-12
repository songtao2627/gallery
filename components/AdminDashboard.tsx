import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import RibbonBackground from './RibbonBackground';
import AdminTiltCard from './AdminTiltCard';
import { Modal, ModalHeader, StyledInput, StyledTextArea, StyledSelect, StyledActionButtons, TagSelector, IconSelector, ColorSelector } from './AdminShared';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [session, setSession] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<'projects' | 'tags'>('projects');

    // Tag State
    const [editingTag, setEditingTag] = useState<{ old: string; new: string } | null>(null);
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagProjects, setNewTagProjects] = useState<string[]>([]);

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
            const newId = editingProject.title?.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);
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
            icon: 'star'
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
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 rounded-xl border-2 border-[var(--theme-text)] text-[var(--theme-text)] font-bold transition-all hover:bg-[var(--theme-text)] hover:text-[var(--theme-bg)] backdrop-blur-md"
                                >
                                    查看站点
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 font-bold transition-all hover:bg-red-500 hover:text-white backdrop-blur-md"
                                >
                                    退出登录
                                </button>
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
                                    <button
                                        onClick={openNew}
                                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/30 hover:scale-105 hover:shadow-blue-500/50 transition-all transform"
                                    >
                                        + 新建项目
                                    </button>
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
                                <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-white">标签管理</h2>
                                        <div className="flex items-center gap-4">
                                            <span className="text-slate-400">{tagsWithCounts.length} 个标签</span>
                                            <button
                                                onClick={() => setIsAddTagModalOpen(true)}
                                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                                            >
                                                + 新建标签
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tagsWithCounts.map(({ name: tag, count }, i) => (
                                            <div key={tag} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold cursor-help"
                                                        title="关联项目数"
                                                    >
                                                        {count}
                                                    </div>
                                                    <div>
                                                        {editingTag?.old === tag ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    autoFocus
                                                                    className="bg-black/50 border border-blue-500/50 rounded px-2 py-1 text-white text-sm focus:outline-none w-32"
                                                                    value={editingTag.new}
                                                                    onChange={e => setEditingTag({ ...editingTag, new: e.target.value })}
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'Enter') handleRenameTag();
                                                                        if (e.key === 'Escape') setEditingTag(null);
                                                                    }}
                                                                />
                                                                <button onClick={handleRenameTag} className="text-green-400 hover:text-green-300">
                                                                    <span className="material-symbols-rounded text-lg">check</span>
                                                                </button>
                                                                <button onClick={() => setEditingTag(null)} className="text-red-400 hover:text-red-300">
                                                                    <span className="material-symbols-rounded text-lg">close</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="font-bold text-slate-200">{tag}</div>
                                                        )}
                                                        <div className="text-xs text-slate-500">关联 {count} 个项目</div>
                                                    </div>
                                                </div>

                                                {!editingTag && (
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingTag({ old: tag, new: tag })}
                                                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-all"
                                                            title="重命名标签"
                                                        >
                                                            <span className="material-symbols-rounded">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTag(tag)}
                                                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-all"
                                                            title="删除标签"
                                                        >
                                                            <span className="material-symbols-rounded">delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
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

                                                <div className="grid grid-cols-2 gap-4">
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
                                                    label="项目路径 / 链接"
                                                    icon="link"
                                                    value={editingProject.projectPath || ''}
                                                    onChange={e => setEditingProject({ ...editingProject, projectPath: e.target.value })}
                                                    placeholder="/project-path"
                                                    className="font-mono text-sm"
                                                />
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

                                    {/* Project Selection */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">关联项目 <span className="text-[var(--theme-title)] opacity-70 normal-case ml-1 font-normal tracking-normal">(可选)</span></label>
                                            <span className="text-xs font-bold" style={{ color: 'var(--theme-title)' }}>{newTagProjects.length} 已选</span>
                                        </div>
                                        <div className="h-48 overflow-y-auto custom-scrollbar border border-white/10 rounded-xl bg-black/20 p-2">
                                            {projects.map(project => (
                                                <div
                                                    key={project.id}
                                                    onClick={() => toggleProjectForNewTag(project.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${newTagProjects.includes(project.id)
                                                        ? 'bg-white/10 border border-white/20'
                                                        : 'hover:bg-white/5 border border-transparent'
                                                        }`}
                                                >
                                                    <div
                                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${newTagProjects.includes(project.id)
                                                            ? 'border-[var(--theme-title)]'
                                                            : 'border-slate-600'
                                                            }`}
                                                        style={newTagProjects.includes(project.id) ? { backgroundColor: 'var(--theme-title)' } : {}}
                                                    >
                                                        {newTagProjects.includes(project.id) && (
                                                            <span className="material-symbols-rounded text-xs text-black font-bold">check</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-medium ${newTagProjects.includes(project.id) ? 'text-white' : 'text-slate-400'
                                                        }`}>
                                                        {project.title}
                                                    </span>
                                                </div>
                                            ))}
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
