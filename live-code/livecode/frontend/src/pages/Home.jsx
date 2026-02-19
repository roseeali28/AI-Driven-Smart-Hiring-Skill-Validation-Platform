import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-mesh relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            {/* Animated background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '0s' }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>

            <main className="relative z-10 max-w-4xl mx-auto">
                <div className="inline-block px-4 py-1.5 mb-6 glass-panel rounded-full text-blue-400 text-sm font-bold tracking-widest uppercase animate-pulse">
                    The Future of Technical Assessment
                </div>

                <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight leading-tight">
                    Welcome to <br />
                    <span className="gradient-text">HiredUp Lab</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    A professional-grade environment designed to sharpen your logic,
                    master complex structures, and prepare you for high-stakes engineering interviews.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button
                        onClick={() => navigate('/problems')}
                        className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-blue-600/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            Enter the Lab <span className="text-xl">🚀</span>
                        </span>
                    </button>

                    <button className="px-8 py-4 glass-panel text-white font-bold rounded-2xl hover:bg-white/5 transition-all">
                        View Documentation
                    </button>
                </div>
            </main>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-24 relative z-10">
                <div className="glass-card p-8 rounded-3xl text-left group">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">💻</div>
                    <h3 className="text-xl font-bold mb-3 text-white">Live Execution</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Run your code locally in real-time with zero latency. Support for JS, Python, and C++.</p>
                </div>

                <div className="glass-card p-8 rounded-3xl text-left group">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🧠</div>
                    <h3 className="text-xl font-bold mb-3 text-white">AI Analysis</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Get deep insights into your problem-solving patterns and technical aptitude using our AI engine.</p>
                </div>

                <div className="glass-card p-8 rounded-3xl text-left group">
                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🏆</div>
                    <h3 className="text-xl font-bold mb-3 text-white">Career Ready</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Solve hand-picked industry problems that top companies use to evaluate engineering talent.</p>
                </div>
            </div>

            <footer className="mt-24 text-gray-500 text-sm font-medium tracking-wide relative z-10">
                © 2026 HiredUp • Built for Elite Engineers
            </footer>
        </div>
    );
};

export default Home;
