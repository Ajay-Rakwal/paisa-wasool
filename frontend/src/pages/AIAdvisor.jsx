import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Send } from 'lucide-react';

const MAX_WORDS = 2000;

const countWords = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

const AIAdvisor = () => {
    const { token, user, setUser } = useContext(AuthContext);
    const [prompt, setPrompt] = useState('');
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(false);
    const [limitError, setLimitError] = useState('');
    const [queryCount, setQueryCount] = useState(user?.aiQueryCount || 0);

    const isDemo = user?.email === 'demo@paisawasool.com';

    // Refresh query count on load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setQueryCount(data.aiQueryCount || 0);
                    setUser(data);
                }
            } catch (err) { console.error(err); }
        };
        fetchUser();
    }, [token]);

    const wordCount = countWords(prompt);

    const handlePromptChange = (e) => {
        const val = e.target.value;
        if (countWords(val) <= MAX_WORDS) {
            setPrompt(val);
            setLimitError('');
        } else {
            setLimitError(`Word limit reached! Maximum ${MAX_WORDS} words allowed.`);
        }
    };

    const handleAskAdvice = async (e) => {
        e.preventDefault();
        if (!prompt) return;
        if (wordCount > MAX_WORDS) {
            setLimitError(`Word limit reached! Maximum ${MAX_WORDS} words allowed.`);
            return;
        }
        
        setLoading(true);
        setAdvice('');
        setLimitError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/advisor`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) {
                const data = await res.json();
                setAdvice("Failed to get advice: " + (data.message || 'Unknown error'));
                setLoading(false);
                return;
            }

            // Handle streaming response
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedAdvice = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                accumulatedAdvice += chunk;
                setAdvice(accumulatedAdvice);
                setLoading(false);
            }
            // Update local count
            if (isDemo) setQueryCount(prev => prev + 1);
        } catch (err) {
            console.error('Fetch error:', err);
            setAdvice("Server error while contacting AI.");
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sparkles size={28} color="var(--brand-primary)" /> 
                Smart AI Advisor
            </h1>
            <p className="text-muted" style={{ marginBottom: '32px' }}>
                Ask our Groq-powered AI for personalized financial advice based on your recent spending and budgets.
            </p>

            <div className="card" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleAskAdvice} style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="E.g., How can I reduce my food expenses?" 
                            value={prompt}
                            onChange={handlePromptChange}
                            required
                            style={{ flex: 1, marginBottom: 0 }}
                        />
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={loading || wordCount > MAX_WORDS || (isDemo && queryCount >= 5)} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                padding: '0 24px',
                                fontSize: '0.95rem',
                                borderRadius: 'var(--radius-sm)'
                            }}
                        >
                            <Send size={18} /> {isDemo && queryCount >= 5 ? 'Limit Reached' : 'Ask'}
                        </button>
                    </div>
                    {/* Word count — always visible */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginTop: '8px' 
                    }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <span style={{ 
                                fontSize: '0.8rem', 
                                color: wordCount > MAX_WORDS * 0.9 ? 'var(--danger)' : 'var(--text-muted-secondary)' 
                            }}>
                                {wordCount} / {MAX_WORDS} words
                            </span>
                            {isDemo && (
                                <span style={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: '600',
                                    color: queryCount >= 5 ? 'var(--danger)' : 'var(--brand-primary)' 
                                }}>
                                    Queries remaining: {Math.max(0, 5 - queryCount)}/5
                                </span>
                            )}
                        </div>
                        {limitError && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: '600' }}>
                                {limitError}
                            </span>
                        )}
                    </div>
                </form>

                {advice && (
                    <div style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '24px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-color)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                    }}>
                        <div style={{ color: 'var(--brand-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <Sparkles size={18} /> AI Response
                        </div>
                        {advice.replace(/\*\*/g, '')}
                    </div>
                )}
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <h2 style={{ color: 'white', fontWeight: 600 }}>Consulting your financial advisor...</h2>
                    <p className="text-muted">Finding the best insights for you</p>
                </div>
            )}
        </div>
    );
};

export default AIAdvisor;
