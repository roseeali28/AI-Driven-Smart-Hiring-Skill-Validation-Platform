import React from 'react';

const ProblemPanel = ({ problem }) => {
    if (!problem) return (
        <div className="p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center bg-[#1a1a1a]">
            <p className="text-lg font-medium">Select a problem to start</p>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto bg-[#1a1a1a] text-[#eff1f6f2] scrollbar-thin selection:bg-blue-500/30">
            {/* Tabs Header Mimic */}
            <div className="flex bg-[#282828] border-b border-[#3e3e3e] px-4">
                <div className="px-4 py-3 text-sm font-medium border-b-2 border-white cursor-pointer transition-colors">Description</div>
                <div className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white cursor-not-allowed opacity-50 transition-colors">Editorial</div>
                <div className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white cursor-not-allowed opacity-50 transition-colors">Solutions</div>
                <div className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white cursor-not-allowed opacity-50 transition-colors">Submissions</div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
                <header>
                    <h1 className="text-2xl font-bold text-white mb-4">
                        {problem.title}
                    </h1>

                    <div className="flex flex-wrap gap-4 items-center">
                        <span className={`px-3 py-1 rounded-full text-[13px] font-medium leading-normal ${problem.difficulty === 'Easy' ? 'badge-easy' :
                                problem.difficulty === 'Medium' ? 'badge-medium' :
                                    'badge-hard'
                            }`}>
                            {problem.difficulty}
                        </span>
                        {problem.tags && problem.tags.map(tag => (
                            <span key={tag} className="bg-[#3a3a3a] text-gray-400 px-3 py-1 rounded-full text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                </header>

                <div className="space-y-8">
                    {/* DESCRIPTION */}
                    <div className="text-[16px] leading-[1.6] text-gray-300 space-y-4">
                        <p>{problem.description}</p>
                    </div>

                    {/* CONSTRAINTS */}
                    {problem.constraints && problem.constraints.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-[#3e3e3e]">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Constraints:</h3>
                            <ul className="space-y-3 px-4">
                                {problem.constraints.map((c, i) => (
                                    <li key={i} className="list-disc text-sm text-gray-400 font-medium font-mono bg-[#282828] px-2 py-1 rounded border border-[#3e3e3e] inline-block mr-2 mb-2">
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* EXAMPLES (LeetCode Style) */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Example 1:</h3>
                        <div className="bg-[#282828] p-4 rounded-lg border border-[#3e3e3e] space-y-3 font-mono text-sm leading-relaxed">
                            <div>
                                <span className="text-gray-500 font-bold block mb-1 uppercase text-[10px]">Input:</span>
                                <code className="text-[#eff1f6f2]">{problem.exampleInput}</code>
                            </div>
                            <div>
                                <span className="text-gray-500 font-bold block mb-1 uppercase text-[10px]">Output:</span>
                                <code className="text-[#eff1f6f2]">{problem.exampleOutput}</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemPanel;
