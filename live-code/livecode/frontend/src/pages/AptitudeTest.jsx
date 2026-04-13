import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

const AptitudeTest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const topic = location.state?.topic || null;

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [results, setResults] = useState({ correct: 0, wrong: 0, completed: false });
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(() => localStorage.getItem('hiredUpTheme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hiredUpTheme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const url = topic ? `/aptitude?topic=${encodeURIComponent(topic)}` : '/aptitude';
                const { data } = await api.get(url);
                setQuestions(data);
            } catch (err) {
                console.error('Failed to fetch questions', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [topic]);

    const handleAnswerSubmission = async () => {
        if (!questions[currentIndex]) return;
        const isCorrect = selectedOption === questions[currentIndex].correctAnswer;
        let newCorrect = results.correct;
        let newWrong = results.wrong;

        if (isCorrect) {
            newCorrect++;
            setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            newWrong++;
            setResults(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        }

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
        } else {
            setResults(prev => ({ ...prev, completed: true }));
            
            // Submit results to backend
            try {
                const userString = localStorage.getItem('hiredUpUser');
                const user = userString ? JSON.parse(userString) : null;
                
                if (user && user._id && user._id !== 'undefined') {
                    console.log('Finalizing test for user:', user._id);
                    await api.post('/aptitude/submit', {
                        userId: user._id,
                        topic: topic || 'General',
                        category: questions[0]?.category || 'General',
                        score: Math.round((newCorrect / questions.length) * 100),
                        totalQuestions: questions.length,
                        correctAnswers: newCorrect,
                        wrongAnswers: newWrong
                    });
                    console.log('Result persisted successfully');
                }
            } catch (err) {
                console.error('Failed to persist result', err);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    if (results.completed) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="glass-panel p-12 rounded-[2rem] border border-white/10 max-w-md w-full">
                    <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">🏆</div>
                    <h2 className="text-4xl font-black mb-2 tracking-tight">Test Completed!</h2>
                    <p className="text-gray-400 mb-8 font-medium">Here's how you performed in {topic || 'General Aptitude'}</p>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                            <div className="text-3xl font-black text-green-500">{results.correct}</div>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-green-500/60">Correct</div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                            <div className="text-3xl font-black text-red-500">{results.wrong}</div>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-red-500/60">Wrong</div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/aptitude-selection')}
                        className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all active:scale-95"
                    >
                        Try Another Topic
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full mt-4 py-4 text-gray-500 font-bold hover:text-white transition-colors"
                    >
                        Exit to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center">
                <p className="text-gray-500 mb-6 text-xl">No questions available for this topic yet.</p>
                <button onClick={() => navigate('/aptitude-selection')} className="px-8 py-3 bg-blue-600 rounded-xl font-bold">Go Back</button>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 flex items-center justify-center rounded-full transition-all border border-white/10 hover:border-blue-500/40 bg-white/5"
                            title="Toggle Dark/Bright Mode"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500/60">
                            Section: {topic || 'Aptitude'}
                        </span>
                    </div>
                    <span className="bg-white/5 px-4 py-1.5 rounded-full text-xs font-bold border border-white/5">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                </div>

                <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-1.5 bg-blue-600 transition-all duration-500" style={{ width: `${((currentIndex) / questions.length) * 100}%` }}></div>

                    <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-10 text-gray-100">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-4">
                        {(currentQuestion.options || []).map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedOption(idx)}
                                className={`w-full p-6 text-left rounded-2xl border transition-all flex items-center gap-4 group ${selectedOption === idx
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20'
                                        : 'border-white/5 hover:border-white/20 text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedOption === idx ? 'bg-white border-white text-blue-600' : 'border-gray-600 group-hover:border-gray-400'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="font-medium text-lg">{option}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
                        <button
                            disabled={selectedOption === null}
                            onClick={handleAnswerSubmission}
                            className={`px-10 py-5 rounded-2xl font-black tracking-wider uppercase text-sm transition-all active:scale-95 ${selectedOption === null
                                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 cursor-pointer'
                                }`}
                        >
                            {currentIndex + 1 === questions.length ? 'Finish Assessment' : 'Next Question'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AptitudeTest;
