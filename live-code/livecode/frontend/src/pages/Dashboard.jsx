import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState('All');

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

    const tags = ['All', 'DSA', 'Arrays', 'Strings', 'Linked List', 'Tree', 'Stack', 'Frontend', 'Backend'];
    const filteredProblems = selectedTag === 'All'
        ? problems
        : problems.filter(p => p.tags.includes(selectedTag));

    if (loading) return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Loading problems...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-[#eff1f6f2] p-4 md:p-8 font-sans selection:bg-blue-500/30">
            {/* Simple Clean Header */}
            <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#3e3e3e] pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="text-[#ffa116]">CodeMaster</span>
                        <span>Pro</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Platform for professional interview preparation</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">{problems.length}</div>
                        <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total</div>
                    </div>
                    <div className="h-8 w-[1px] bg-[#3e3e3e]"></div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-[#00b8a3]">{problems.filter(p => p.difficulty === 'Easy').length}</div>
                        <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-[#00b8a3]/60">Easy</div>
                    </div>
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
                <div className="bg-[#1a1a1a] border border-[#3e3e3e] rounded-xl overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#3e3e3e] bg-[#282828]">
                                    <th className="px-6 py-4 text-gray-400 font-medium uppercase text-[10px] tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-gray-400 font-medium uppercase text-[10px] tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-gray-400 font-medium uppercase text-[10px] tracking-wider">Difficulty</th>
                                    <th className="px-6 py-4 text-gray-400 font-medium uppercase text-[10px] tracking-wider">Category</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3e3e3e]">
                                {filteredProblems.map((problem, idx) => (
                                    <tr
                                        key={problem._id}
                                        onClick={() => navigate(`/solve/${problem._id}`)}
                                        className={`hover:bg-[#323232] cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#282828]'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[15px] font-medium text-gray-200 hover:text-blue-400 transition-colors">
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
                                                {problem.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-gray-500 bg-[#3a3a3a] px-2 py-0.5 rounded text-[11px] font-medium">
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
