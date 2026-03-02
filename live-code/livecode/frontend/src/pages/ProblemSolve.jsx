import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api';
import ProblemPanel from '../components/ProblemPanel';
import OutputConsole from '../components/OutputConsole';

const DEFAULT_TEMPLATES = {
    javascript: `// Write your JavaScript code here\n\nfunction solution() {\n    console.log("Hello, HiredUp!");\n}\n\nsolution();`,
    python: `# Write your Python code here\n\ndef solution():\n    print("Hello, HiredUp!")\n\nif __name__ == "__main__":\n    solution()`,
    cpp: `// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, HiredUp!" << std::endl;\n    return 0;\n}`
};

const ProblemSolve = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState({ id: 'javascript', label: 'JavaScript' });
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const languages = [
        { id: 'javascript', label: 'JavaScript' },
        { id: 'python', label: 'Python (Local)' },
        { id: 'cpp', label: 'C++ (Local)' }
    ];

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const { data } = await api.get(`/problems/${id}`);
                setProblem(data);

                // Use starter code from DB if exists, otherwise use template
                const starter = data.starterCode?.[language.id] || DEFAULT_TEMPLATES[language.id] || '';
                setCode(starter);
            } catch (err) {
                console.error('Failed to fetch problem', err);
                // Even if problem fetch fails (e.g. for general practice), set a template
                setCode(DEFAULT_TEMPLATES[language.id]);
                // Set a mock problem for general practice if id is not found or it's a generic route
                setProblem({ title: 'General Practice', description: 'Practice your coding skills here.' });
            }
        };
        fetchProblem();
    }, [id, language.id]);

    const handleRunCode = async () => {
        setLoading(true);
        setStatus('Processing...');
        try {
            const { data } = await api.post('/execute/run', {
                code,
                language: language.id,
                testCases: problem?.testCases || []
            });
            setOutput(data.output);
            setStatus(data.success ? 'Accepted' : 'Wrong Answer');
        } catch (err) {
            setOutput(err.response?.data?.error || 'Execution failed');
            setStatus('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setStatus('Submitting...');
        try {
            const { data } = await api.post('/execute/submit', {
                problemId: id,
                code,
                language: language.id
            });
            setStatus(data.success ? 'Success' : 'Failed');
            setOutput(data.feedback || 'Reviewing your code...');
        } catch (err) {
            setStatus('Error');
            setOutput('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLanguageChange = (e) => {
        const selected = languages.find(l => l.id === e.target.value);
        setLanguage(selected);
        // Update code when language changes if it's currently a template
        if (code === DEFAULT_TEMPLATES[language.id] || code === '') {
            setCode(DEFAULT_TEMPLATES[selected.id]);
        }
    };

    if (!problem && id !== 'practice') return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-[#eff1f6f2] overflow-hidden font-sans">
            {/* Header */}
            <header className="h-12 bg-[#282828] border-b border-[#3e3e3e] flex items-center px-4 justify-between z-50">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span className="text-xl">←</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
                    </Link>
                    <div className="h-6 w-[1px] bg-[#3e3e3e]"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-200">{problem?.title || 'Coding Practice'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        className="bg-[#3e3e3e] border border-[#4e4e4e] rounded px-3 py-1 text-xs font-medium text-gray-200 outline-none cursor-pointer hover:bg-[#4e4e4e]"
                        value={language.id}
                        onChange={handleLanguageChange}
                    >
                        {languages.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.label}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <button
                            onClick={handleRunCode}
                            disabled={loading || submitting}
                            className="px-4 py-1.5 rounded bg-[#3e3e3e] text-white text-xs font-bold hover:bg-[#4e4e4e] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'RUNNING...' : 'Run'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || submitting}
                            className="px-4 py-1.5 rounded bg-[#2cbb5d] text-white text-xs font-bold hover:bg-[#34d06c] transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'PROCESSING...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Split Interface */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Problem Description */}
                <div className="w-[40%] min-w-[300px] flex flex-col border-r border-[#3e3e3e]">
                    <ProblemPanel problem={problem} />
                </div>

                {/* Right: Editor & Console */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                    <div className="flex-1 relative min-h-0">
                        <Editor
                            height="100%"
                            language={language.id === 'cpp' ? 'cpp' : language.id}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                lineNumbersMinChars: 4,
                                wordWrap: 'on',
                                backgroundColor: '#1e1e1e',
                                automaticLayout: true
                            }}
                        />
                    </div>
                    {/* Console Section - Fixed height, scroll handled inside OutputConsole */}
                    <div className="h-[250px] border-t border-[#3e3e3e] flex-shrink-0">
                        <OutputConsole output={output} status={status} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemSolve;
