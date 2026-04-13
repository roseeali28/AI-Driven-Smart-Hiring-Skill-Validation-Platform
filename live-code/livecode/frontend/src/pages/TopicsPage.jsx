import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TOPIC_META = {
    'Arrays': {
        icon: '[ ]',
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.25)',
        desc: 'Index-based data collection problems'
    },
    'Strings': {
        icon: '"s"',
        color: '#8b5cf6',
        bg: 'rgba(139,92,246,0.12)',
        border: 'rgba(139,92,246,0.25)',
        desc: 'Character sequences and manipulation'
    },
    'Linked List': {
        icon: '→',
        color: '#06b6d4',
        bg: 'rgba(6,182,212,0.12)',
        border: 'rgba(6,182,212,0.25)',
        desc: 'Node-based sequential data structures'
    },
    'Tree': {
        icon: '🌲',
        color: '#10b981',
        bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)',
        desc: 'Hierarchical node structures'
    },
    'Stack': {
        icon: '⬆',
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.25)',
        desc: 'Last-In-First-Out data structure'
    },
    'DP': {
        icon: '◆',
        color: '#ec4899',
        bg: 'rgba(236,72,153,0.12)',
        border: 'rgba(236,72,153,0.25)',
        desc: 'Optimal substructure & memoization'
    },
    'Recursion': {
        icon: '↩',
        color: '#a855f7',
        bg: 'rgba(168,85,247,0.12)',
        border: 'rgba(168,85,247,0.25)',
        desc: 'Self-referential function problems'
    },
    'JavaScript': {
        icon: 'JS',
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.12)',
        border: 'rgba(251,191,36,0.25)',
        desc: 'Core JS concepts and polyfills'
    },
    'Node.js': {
        icon: '⬡',
        color: '#4ade80',
        bg: 'rgba(74,222,128,0.12)',
        border: 'rgba(74,222,128,0.25)',
        desc: 'Server-side backend challenges'
    },
    'DSA': {
        icon: '∑',
        color: '#f97316',
        bg: 'rgba(249,115,22,0.12)',
        border: 'rgba(249,115,22,0.25)',
        desc: 'Data Structures & Algorithms'
    },
};

const DEFAULT_META = {
    icon: '#',
    color: '#9ca3af',
    bg: 'rgba(156,163,175,0.12)',
    border: 'rgba(156,163,175,0.25)',
    desc: 'Mixed topic problems'
};

const DIFF_COLOR = {
    Easy: '#00b8a3',
    Medium: '#ffb800',
    Hard: '#ff2d55',
};

const TopicsPage = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTopic, setExpandedTopic] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem('hiredUpTheme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hiredUpTheme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/problems');
                setProblems(data);
            } catch (err) {
                console.error('Failed to fetch problems', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // Build topic map: tag -> problems[]
    const topicMap = {};
    problems.forEach(p => {
        (p.tags || []).forEach(tag => {
            if (tag === 'DSA') return; // DSA is a category umbrella, skip as a standalone section
            if (!topicMap[tag]) topicMap[tag] = [];
            topicMap[tag].push(p);
        });
    });

    // Also add DSA as a grouped section for problems tagged DSA with no other specific tag
    const dsaProblems = problems.filter(p => (p.tags || []).includes('DSA'));
    if (dsaProblems.length > 0 && !topicMap['DSA']) {
        topicMap['DSA'] = dsaProblems;
    }

    const topicEntries = Object.entries(topicMap).sort((a, b) => b[1].length - a[1].length);

    if (loading) return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-[#eff1f6f2] font-sans">
            {/* Header */}
            <header className="border-b border-[#3e3e3e] bg-[#1a1a1a] sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <span className="text-lg">←</span> Dashboard
                        </button>
                        <div className="h-5 w-[1px] bg-[#3e3e3e]"></div>
                        <h1 className="text-lg font-bold text-white">Browse by Topic</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#3e3e3e] hover:border-[#5e5e5e]"
                            style={{ backgroundColor: 'var(--leetcode-dark-layer)', fontSize: '1.2rem' }}
                            title="Toggle Dark/Bright Mode"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        <span className="text-xs text-gray-500 font-medium">
                            {topicEntries.length} Topics · {problems.length} Problems
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Hero */}
                <div className="mb-10">
                    <p className="text-gray-400 text-base mt-1">
                        Pick a topic and practice targeted problems to sharpen specific skills.
                    </p>
                </div>

                {/* Topic Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {topicEntries.map(([tag, tagProblems]) => {
                        const meta = TOPIC_META[tag] || DEFAULT_META;
                        const easy = tagProblems.filter(p => p.difficulty === 'Easy').length;
                        const medium = tagProblems.filter(p => p.difficulty === 'Medium').length;
                        const hard = tagProblems.filter(p => p.difficulty === 'Hard').length;
                        const isExpanded = expandedTopic === tag;

                        return (
                            <div key={tag}>
                                {/* Card */}
                                <div
                                    onClick={() => setExpandedTopic(isExpanded ? null : tag)}
                                    className="rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                                    style={{
                                        background: meta.bg,
                                        borderColor: isExpanded ? meta.color : meta.border,
                                        boxShadow: isExpanded ? `0 0 20px ${meta.color}25` : 'none',
                                    }}
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className="w-11 h-11 rounded-lg flex items-center justify-center text-sm font-black border"
                                                style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
                                            >
                                                {meta.icon}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-2xl font-black" style={{ color: meta.color }}>
                                                    {tagProblems.length}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium self-end mb-1">problems</span>
                                            </div>
                                        </div>

                                        <h3 className="text-base font-bold text-white mb-1">{tag}</h3>
                                        <p className="text-xs text-gray-500 mb-4 font-medium">{meta.desc}</p>

                                        {/* Difficulty bar */}
                                        <div className="space-y-1.5">
                                            <div className="flex h-1.5 rounded-full overflow-hidden bg-[#3e3e3e]">
                                                {easy > 0 && (
                                                    <div
                                                        className="h-full transition-all"
                                                        style={{ width: `${(easy / tagProblems.length) * 100}%`, background: DIFF_COLOR.Easy }}
                                                    />
                                                )}
                                                {medium > 0 && (
                                                    <div
                                                        className="h-full transition-all"
                                                        style={{ width: `${(medium / tagProblems.length) * 100}%`, background: DIFF_COLOR.Medium }}
                                                    />
                                                )}
                                                {hard > 0 && (
                                                    <div
                                                        className="h-full transition-all"
                                                        style={{ width: `${(hard / tagProblems.length) * 100}%`, background: DIFF_COLOR.Hard }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex gap-3 text-[10px] font-bold">
                                                {easy > 0 && <span style={{ color: DIFF_COLOR.Easy }}>{easy} Easy</span>}
                                                {medium > 0 && <span style={{ color: DIFF_COLOR.Medium }}>{medium} Medium</span>}
                                                {hard > 0 && <span style={{ color: DIFF_COLOR.Hard }}>{hard} Hard</span>}
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/?tag=${encodeURIComponent(tag)}`);
                                                }}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                                style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
                                            >
                                                Solve All →
                                            </button>
                                            <span className="text-xs text-gray-600 font-medium">
                                                {isExpanded ? '▲ Hide' : '▼ Preview'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded problem list */}
                                {isExpanded && (
                                    <div className="mt-2 rounded-xl border border-[#3e3e3e] bg-[#1e1e1e] overflow-hidden">
                                        {tagProblems.map((problem, idx) => (
                                            <div
                                                key={problem._id}
                                                onClick={() => navigate(`/solve/${problem._id}`)}
                                                className={`flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[#282828] transition-colors ${idx !== tagProblems.length - 1 ? 'border-b border-[#3e3e3e]' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-600 font-mono w-5">{idx + 1}.</span>
                                                    <span className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
                                                        {problem.title}
                                                    </span>
                                                </div>
                                                <span
                                                    className="text-[11px] font-bold"
                                                    style={{ color: DIFF_COLOR[problem.difficulty] || '#9ca3af' }}
                                                >
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default TopicsPage;
