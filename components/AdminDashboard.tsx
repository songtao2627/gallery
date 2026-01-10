import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [session, setSession] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false); // New state for upload status

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
        if (session) fetchProjects();
    }, [session]);

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

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
            setProjects(projects.filter(p => p.id !== id));
        } else {
            alert('Error deleting project: ' + error.message);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;

        // Convert camelCase back to snake_case for DB
        const dbData = {
            title: editingProject.title,
            description: editingProject.description,
            category: editingProject.category,
            project_path: editingProject.projectPath,
            image_path: editingProject.imagePath,
            tags: editingProject.tags,
            color: editingProject.color,
            icon: editingProject.icon,
            // id is handled based on insert/update
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
            // Create - Generate a random ID if not provided (or let DB handle it if UUID, but schema says text)
            // Let's generate a simple ID based on title for now or timestamp
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
        } else {
            alert('Error saving project: ' + error.message);
        }
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
            tags: [],
            color: 'text-blue-500',
            icon: 'star'
        });
        setIsModalOpen(true);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    }

    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white font-body p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                        Gallery Admin
                    </h1>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 transition">
                            View Site
                        </button>
                        <button onClick={handleLogout} className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 transition">
                            Logout
                        </button>
                        <button onClick={openNew} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold transition shadow-lg shadow-blue-500/30">
                            + New Project
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden group hover:border-slate-500 transition-all">
                            <div className="aspect-video relative">
                                <img src={project.imagePath} alt={project.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => openEdit(project)} className="p-2 bg-blue-600 rounded-full hover:bg-blue-500 text-white">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(project.id)} className="p-2 bg-red-600 rounded-full hover:bg-red-500 text-white">
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{project.title}</h3>
                                    <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">{project.category}</span>
                                </div>
                                <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && editingProject && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">
                                {editingProject.id ? 'Edit Project' : 'New Project'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Title</label>
                                    <input
                                        value={editingProject.title || ''}
                                        onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Category</label>
                                    <select
                                        value={editingProject.category || 'Work'}
                                        onChange={e => setEditingProject({ ...editingProject, category: e.target.value as any })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                                    >
                                        <option value="Work">Work</option>
                                        <option value="Life">Life</option>
                                        <option value="Learning">Learning</option>
                                        <option value="IT">IT</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={editingProject.description || ''}
                                    onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 h-24"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Image URL</label>
                                    <input
                                        value={editingProject.imagePath || ''}
                                        onChange={e => setEditingProject({ ...editingProject, imagePath: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Upload Image (Replaces URL)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                if (!e.target.files || e.target.files.length === 0) return;
                                                const file = e.target.files[0];
                                                const fileExt = file.name.split('.').pop();
                                                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                                                const filePath = `${fileName}`;

                                                setUploading(true);
                                                const { error: uploadError } = await supabase.storage
                                                    .from('gallery-images')
                                                    .upload(filePath, file);

                                                if (uploadError) {
                                                    alert('Upload failed: ' + uploadError.message);
                                                    setUploading(false);
                                                    return;
                                                }

                                                const { data: { publicUrl } } = supabase.storage
                                                    .from('gallery-images')
                                                    .getPublicUrl(filePath);

                                                setEditingProject(prev => ({ ...prev, imagePath: publicUrl }));
                                                setUploading(false);
                                            }}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-600 file:text-white
                                            hover:file:bg-blue-500"
                                        />
                                        {uploading && <div className="absolute right-3 top-2 text-blue-400 text-xs font-bold animate-pulse">Uploading...</div>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Project Path / Link</label>
                                <input
                                    value={editingProject.projectPath || ''}
                                    onChange={e => setEditingProject({ ...editingProject, projectPath: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                                />
                            </div>

                            {/* Could add Color/Icon/Tags inputs similarly */}

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold">Save Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
