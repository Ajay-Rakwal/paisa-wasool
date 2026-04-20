import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Target, AlertCircle, Save } from 'lucide-react';
import { apiFetch } from '../utils/api';

const Budget = () => {
  const auth = useContext(AuthContext);
  const [budget, setBudget] = useState(null);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBudget();
  }, [auth.token, auth.isDemo]);

  const fetchBudget = async () => {
    try {
      const data = await apiFetch('/api/budget', {}, auth);
      setBudget(data);
      setMonthlyLimit(data.monthlyLimit || '');
    } catch(err) { console.error("Error fetching budget:", err); }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await apiFetch('/api/budget', {
        method: 'POST',
        body: JSON.stringify({ monthlyLimit: Number(monthlyLimit) }),
      }, auth);
      setMessage('Budget updated successfully!');
      fetchBudget();
    } catch(err) {
      console.error(err);
      setMessage('Failed to update budget.');
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Budget Management</h1>
        {auth.isDemo && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: 'var(--brand-primary)', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontSize: '0.85rem', 
            fontWeight: 'bold',
            border: '1px solid var(--brand-primary)'
          }}>
            Local Demo Instance
          </div>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={24} color="var(--brand-primary)" /> 
            Monthly Limit
          </h3>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
            Set a cap on your absolute spending per month to receive alerts when tracking your expenses.
          </p>

          <form onSubmit={handleSaveBudget}>
            <label className="label">Monthly Budget Limit (₹)</label>
            <input 
                type="number" 
                className="input-field" 
                value={monthlyLimit} 
                onChange={(e) => setMonthlyLimit(e.target.value)} 
                placeholder="e.g. 5000"
                min="0"
                required
            />
            <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} 
                disabled={loading || isDemo}
            >
              <Save size={18} /> {isDemo ? 'Save Limit (Disabled in Demo)' : (loading ? 'Saving...' : 'Save Limit')}
            </button>
            {message && <div style={{ marginTop: '12px', color: message.includes('success') ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem' }}>{message}</div>}
          </form>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={24} color="var(--warning)" />
                Current Status
            </h3>
            
            {budget ? (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <div className="text-muted" style={{ marginBottom: '8px' }}>Active Monthly Budget</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₹{budget.monthlyLimit}</div>
                </div>
            ) : (
                <div className="text-muted">Loading your budget...</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Budget;
