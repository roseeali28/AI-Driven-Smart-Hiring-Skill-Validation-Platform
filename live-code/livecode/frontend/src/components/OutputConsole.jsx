import React from 'react';

const OutputConsole = ({ output, status, loading }) => {
    return (
        <div className="bg-[#1a1a1a] text-[#eff1f6f2] h-full overflow-hidden flex flex-col font-sans border-t border-[#3e3e3e]">
            {/* Console Header Tabs */}
            <div className="flex bg-[#282828] border-b border-[#3e3e3e] px-4 shrink-0">
                <div className="px-4 py-2 text-xs font-bold text-white border-b-2 border-white cursor-pointer transition-colors uppercase tracking-wider">Console</div>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white cursor-not-allowed opacity-50 transition-colors uppercase tracking-wider">Testcase</div>
                {status && (
                    <div className="ml-auto flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${(status === 'Accepted' || status === 'Success') ? 'text-[#00b8a3] bg-[#00b8a3]/10' :
                                'text-[#ef4743] bg-[#ef4743]/10'
                            }`}>
                            {status}
                        </span>
                    </div>
                )}
            </div>

            {/* Console Content */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
                {loading ? (
                    <div className="flex items-center gap-3 py-2 text-gray-500 font-medium">
                        <div className="w-3 h-3 border border-gray-600 border-t-white rounded-full animate-spin"></div>
                        <span className="text-sm">Running code...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {output ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Output</div>
                                    <pre className="whitespace-pre-wrap leading-relaxed text-sm font-mono text-gray-200 bg-[#282828] p-4 rounded border border-[#3e3e3e]">
                                        {output}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                                <p className="text-xs font-medium uppercase tracking-[0.2em]">Ready for execution</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputConsole;
