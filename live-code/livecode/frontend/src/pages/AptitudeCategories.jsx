import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AptitudeCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('hiredUpTheme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hiredUpTheme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/aptitude/topics');
                setCategories(data);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const getCategoryIcon = (categoryName) => {
        const lower = categoryName.toLowerCase();
        if (lower.includes('logical')) return '🧩';
        if (lower.includes('data')) return '📊';
        if (lower.includes('verbal')) return '📝';
        return '🔢'; // Default for Quantitative
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex justify-between items-start">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-500 hover:text-white transition-colors mb-6 flex items-center gap-2 group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
                        </button>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Aptitude <span className="text-blue-500">Practice</span>
                        </h1>
                        <p className="text-gray-400 mt-3 text-lg">Select a specific topic carefully to sharpen your skills.</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="w-12 h-12 flex items-center justify-center rounded-full transition-all border border-white/10 hover:border-blue-500/40 bg-white/5 mt-10"
                        title="Toggle Dark/Bright Mode"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </header>

                <div className="space-y-12">
                    {categories.map((cat) => (
                        <div key={cat.category} className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/5">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl">
                                    {getCategoryIcon(cat.category)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">{cat.category}</h2>
                                    <p className="text-gray-400 text-sm mt-1">{(cat.topics || []).length} specialized topics available</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(cat.topics || []).map((topic) => (
                                    <button
                                        key={topic.name}
                                        onClick={() => navigate('/aptitude-test', { state: { topic: topic.name, category: cat.category } })}
                                        className="group relative flex justify-between items-center bg-[#1a1a1f] p-4 rounded-2xl border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all text-left overflow-hidden"
                                    >
                                        {/* Hover glow effect */}
                                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        
                                        <span className="font-bold text-gray-200 group-hover:text-white relative z-10 transition-colors">
                                            {topic.name}
                                        </span>
                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className="text-xs font-bold bg-[#0a0a0c] text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                                                {topic.questionCount} Qs
                                            </span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 -translate-x-2 group-hover:translate-x-0 transform duration-300">
                                                →
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="py-20 text-center glass-panel rounded-3xl border border-dashed border-white/10">
                            <p className="text-gray-500 italic">No topics found. Please seed the database.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AptitudeCategories;
