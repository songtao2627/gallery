import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import RibbonBackground from './RibbonBackground';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/admin');
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden selection:bg-pink-500 selection:text-white font-body">
            {/* Background Animation */}
            <RibbonBackground initialThemeId="cyber" />

            {/* Glass Card */}
            <div className="relative z-10 w-full max-w-md p-6 mx-4">
                <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl shadow-blue-900/20 transform hover:scale-[1.01] transition-transform duration-700 ease-out"></div>

                <div className="relative z-20 flex flex-col items-center p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Icon / Brand */}
                    <div className="h-20 w-20 mb-8 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center transform hover:rotate-6 transition-transform duration-500">
                        <span className="material-symbols-rounded text-4xl">admin_panel_settings</span>
                    </div>

                    <h2 className="text-4xl font-display font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight text-center">
                        Welcome Back
                    </h2>
                    <p className="text-slate-400 font-medium mb-10 text-center tracking-wide">
                        Enter your credentials to access the console
                    </p>

                    {error && (
                        <div className="w-full mb-8 p-4 bg-red-500/10 backdrop-blur border border-red-500/20 text-red-200 rounded-xl text-sm font-bold flex items-center gap-3 animate-pulse">
                            <span className="material-symbols-rounded text-xl">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full space-y-6">
                        <div className="group space-y-2">
                            <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest pl-1 group-focus-within:text-blue-300 transition-colors">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors material-symbols-rounded text-xl">mail</span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-black/20 border border-white/10 rounded-xl focus:bg-white/5 focus:border-blue-500/50 focus:outline-none transition-all duration-300 text-white placeholder:text-slate-600 font-medium"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div className="group space-y-2">
                            <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest pl-1 group-focus-within:text-blue-300 transition-colors">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors material-symbols-rounded text-xl">lock</span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-black/20 border border-white/10 rounded-xl focus:bg-white/5 focus:border-blue-500/50 focus:outline-none transition-all duration-300 text-white placeholder:text-slate-600 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <span className="material-symbols-rounded group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
