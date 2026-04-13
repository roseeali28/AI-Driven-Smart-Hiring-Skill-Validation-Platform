import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('tag') || 'All';
    });

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const { data } = await api.get('/problems');
                setProblems(data);
            } catch (err) {
                console.error('Failed to fetch problems', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const [theme, setTheme] = useState(() => localStorage.getItem('hiredUpTheme') || 'dark');
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hiredUpTheme', theme);
    }, [theme]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleFocusMode = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        // Combined action as requested
        toggleTheme();
    };

    const tags = ['All', 'DSA', 'Arrays', 'Strings', 'Linked List', 'Tree', 'Stack', 'Frontend', 'Backend'];
    const filteredProblems = selectedTag === 'All'
        ? problems
        : problems.filter(p => (p.tags || []).includes(selectedTag));

    if (loading) return (
        <div className="min-h-screen bg-[var(--leetcode-dark-bg)] bg-[#1a1a1a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Loading problems...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--leetcode-dark-bg)] text-[var(--text-primary)] p-4 md:p-8 font-sans transition-colors duration-300">
            {/* Simple Clean Header */}
            <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[var(--leetcode-dark-border)] pb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                        <span className="text-[#ffa116]">CodeMaster</span>
                        <span>Pro</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Platform for professional interview preparation</p>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleFocusMode}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#3e3e3e] hover:border-[#5e5e5e] ${isFullscreen ? 'bg-indigo-600 border-indigo-400' : ''}`}
                        title={isFullscreen ? 'Exit Focus Mode' : 'Enter Focus Mode (Fullscreen)'}
                    >
                        {isFullscreen ? '内' : '🔲'}
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#3e3e3e] hover:border-[#5e5e5e]"
                        style={{ backgroundColor: 'var(--leetcode-dark-layer)', fontSize: '1.2rem' }}
                        title="Toggle Dark/Bright Mode"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <div className="text-center hidden sm:block">
                        <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{problems.length}</div>
                        <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total</div>
                    </div>
                    <div className="h-8 w-[1px] bg-[#3e3e3e] hidden sm:block"></div>
                    <div className="text-center hidden sm:block">
                        <div className="text-xl font-bold text-[#00b8a3]">{problems.filter(p => p.difficulty === 'Easy').length}</div>
                        <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-[#00b8a3]/60">Easy</div>
                    </div>
                    <div className="h-8 w-[1px] bg-[#3e3e3e] hidden sm:block"></div>
                    <button
                        onClick={() => navigate('/certificates')}
                        className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-purple-600/20 flex items-center gap-2"
                    >
                        <span>🛡️</span> Verify Skills
                    </button>
                    <button
                        onClick={() => navigate('/topics')}
                        className="px-5 py-2 bg-[#282828] hover:bg-[#3e3e3e] text-gray-300 hover:text-white text-sm font-bold rounded-lg transition-all border border-[#3e3e3e] hover:border-[#5e5e5e]"
                    >
                        Browse Topics 🗂️
                    </button>
                    <button
                        onClick={() => navigate('/aptitude-selection')}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                    >
                        Aptitude 🧠
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {/* Filters / Categories */}
                <div className="flex flex-wrap gap-2 mb-8 items-center border-b border-[#3e3e3e] pb-4">
                    {tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`nav-pill ${selectedTag === tag ? 'nav-pill-active' : 'nav-pill-inactive'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Problem Table */}
                <div className="bg-[var(--leetcode-dark-bg)] border border-[var(--leetcode-dark-border)] rounded-xl overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[var(--leetcode-dark-border)] bg-[var(--leetcode-dark-layer)]">
                                    <th className="px-6 py-4 text-[var(--text-secondary)] font-medium uppercase text-[10px] tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[var(--text-secondary)] font-medium uppercase text-[10px] tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-[var(--text-secondary)] font-medium uppercase text-[10px] tracking-wider">Difficulty</th>
                                    <th className="px-6 py-4 text-[var(--text-secondary)] font-medium uppercase text-[10px] tracking-wider">Category</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--leetcode-dark-border)]">
                                {filteredProblems.map((problem, idx) => (
                                    <tr
                                        key={problem._id}
                                        onClick={() => navigate(`/solve/${problem._id}`)}
                                        className={`cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-[var(--leetcode-dark-bg)]' : 'bg-[var(--leetcode-dark-layer)]'} hover:opacity-80`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[15px] font-medium text-[var(--text-primary)] hover:text-blue-400 transition-colors">
                                                {idx + 1}. {problem.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${problem.difficulty === 'Easy' ? 'text-[#00b8a3]' :
                                                problem.difficulty === 'Medium' ? 'text-[#ffb800]' :
                                                    'text-[#ff2d55]'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {(problem.tags || []).slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-[var(--text-secondary)] bg-[var(--leetcode-dark-border)] px-2 py-0.5 rounded text-[11px] font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
