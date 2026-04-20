import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { Wallet, Brain } from 'lucide-react';
import { apiFetch } from '../utils/api';

const COLORS = ['#10B981', '#F59E0B', '#F43F5E', '#0D9488', '#3b82f6', '#ec4899', '#8b5cf6', '#2dd4bf'];

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchData();
  }, [auth.token, auth.isDemo]);

  const fetchData = async () => {
    try {
      const [summaryData, budgetData, insightsData] = await Promise.all([
        apiFetch('/api/expenses/summary', {}, auth),
        apiFetch('/api/budget', {}, auth),
        apiFetch('/api/expenses/insights', {}, auth)
      ]);
      setSummary(summaryData);
      setBudget(budgetData);
      setInsights(insightsData.insights || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  if (!summary) return <div className="page-title">Loading Dashboard...</div>;

  const pieData = Object.keys(summary.categoryTotals || {}).map(key => ({
    name: key,
    value: summary.categoryTotals[key]
  }));

  const totalExpense = summary.totalExpense || 0;
  const budgetLimit = budget?.monthlyLimit || 0;
  const budgetPercent = budgetLimit > 0 ? Math.min((totalExpense / budgetLimit) * 100, 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Overview</h1>
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
      
      {/* Top Value Cards */}
      <div className="dashboard-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card">
          <div className="text-muted">Total Balance</div>
          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', marginTop: '8px' }}>₹{(summary.balance || 0).toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-muted">Total Income</div>
          <div className="text-success" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', marginTop: '8px' }}>+₹{(summary.totalIncome || 0).toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-muted">Total Expenses</div>
          <div className="text-danger" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', marginTop: '8px' }}>-₹{totalExpense.toFixed(2)}</div>
        </div>
      </div>

      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        {/* Left Column: Charts */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Category Breakdown</h3>
          <div style={{ minHeight: '300px', height: '100%', flex: 1 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} innerRadius="55%" outerRadius="80%" paddingAngle={8} dataKey="value" labelLine={false} label={entry => entry.name}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(16px)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="text-muted flex-center" style={{height:'100%'}}>No expense data yet.</div>}
          </div>
        </div>

        {/* Right Column: Budget & ML Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Budget Progress Tracker */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
              <Wallet size={24} color="var(--brand-primary)" /> Monthly Budget
            </h3>
            
            {budgetLimit > 0 ? (
                <div style={{ padding: '10px 0' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <span className="text-muted" style={{fontSize: '1rem'}}>₹{totalExpense.toFixed(2)} spent</span>
                        <span className="text-muted" style={{fontSize: '1rem'}}>₹{budgetLimit} limit</span>
                     </div>
                     {/* Progress Bar Background */}
                     <div style={{ width: '100%', height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                        {/* Progress Bar Fill */}
                        <div style={{ 
                            width: `${budgetPercent}%`, 
                            height: '100%', 
                            background: budgetPercent > 100 ? 'var(--danger)' : 'var(--brand-gradient)',
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 0 20px ${budgetPercent > 90 ? 'var(--danger)' : 'var(--brand-primary)'}`
                        }} />
                     </div>
                     {budgetPercent >= 100 && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.95rem', marginTop: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                            ⚠ Budget Exceeded!
                        </div>
                     )}
                </div>
            ) : (
                <div className="text-muted" style={{ fontSize: '1rem', textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ marginBottom: '16px' }}>No monthly budget set yet.</p>
                    <Link to="/budget" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 32px' }}>Set Budget Now</Link>
                </div>
            )}
          </div>

          {/* ML Insights Display */}
          <div className="card" style={{ flex: 1 }}>
             <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
               <Brain size={24} color="var(--brand-primary)" />
               Habit Insights
             </h3>
             {insights.length > 0 ? (
                 <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0, color: 'var(--text-main)', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {insights.map((msg, i) => (
                         <li key={i} style={{ 
                             padding: '12px 16px', 
                             background: 'rgba(16, 185, 129, 0.08)', 
                             borderRadius: '8px', 
                             borderLeft: '4px solid var(--brand-primary)',
                             display: 'flex',
                             alignItems: 'center',
                             gap: '10px'
                         }}>
                             <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-accent)', flexShrink: 0 }} />
                             {msg}
                         </li>
                     ))}
                 </ul>
             ) : (
                 <div className="text-muted" style={{ fontSize: '1rem', textAlign: 'center', padding: '20px 0' }}>Analyzing your spending patterns...</div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
