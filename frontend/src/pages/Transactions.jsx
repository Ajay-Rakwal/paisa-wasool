import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Edit2, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

const Transactions = () => {
  const auth = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', description: '', category: '', date: '', type: '' });

  useEffect(() => {
    fetchExpenses();
  }, [auth.token, auth.isDemo]);

  const fetchExpenses = async () => {
    try {
      const data = await apiFetch('/api/expenses', {}, auth);
      setExpenses(data);
    } catch(err) { console.error('Fetch error:', err); }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({ amount, description, type, date })
      }, auth);
      setAmount(''); 
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      fetchExpenses();
    } catch(err) { console.error('Add error:', err); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await apiFetch(`/api/expenses/${id}`, { method: 'DELETE' }, auth);
      fetchExpenses();
    } catch(err) { console.error('Delete error:', err); }
  };

  const openEditModal = (ex) => {
    setEditingTransaction(ex._id);
    setEditForm({
      amount: ex.amount,
      description: ex.description,
      category: ex.category,
      date: new Date(ex.date).toISOString().split('T')[0],
      type: ex.type
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/expenses/${editingTransaction}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      }, auth);
      setEditingTransaction(null);
      fetchExpenses();
    } catch (err) { console.error('Update error:', err); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Transactions</h1>
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

      <div className="transactions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Add Transaction</h3>
            <form onSubmit={handleManualAdd}>
              <div className="responsive-flex-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{flex:1}}>
                  <label className="label">Type</label>
                  <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                 <div style={{flex:1}}>
                   <label className="label">Amount</label>
                   <input 
                    type="number" 
                    className="input-field" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    min="0.01" 
                    step="0.01"
                    required 
                   />
                 </div>
               </div>
               
               <div style={{ marginBottom: '12px' }}>
                 <label className="label">Date</label>
                 <input 
                    type="date" 
                    className="input-field" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    max={new Date().toISOString().split('T')[0]}
                    required 
                    style={{ colorScheme: 'dark' }} // Ensures native picker icon is white in dark mode
                 />
               </div>

              <label className="label">
                  {type === 'income' ? 'Description (Where did this come from?)' : 'Description (What did you spend on?)'}
              </label>
              <input 
                type="text" 
                className="input-field" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required 
                placeholder={type === 'income' ? 'e.g. Monthly Salary' : 'e.g. Uber ride to the airport'} 
              />
              
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Record'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
          {expenses.length === 0 ? <p className="text-muted">No transactions yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expenses.map(ex => (
                <div 
                    key={ex._id} 
                    className="transaction-item"
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '16px', 
                        background: 'rgba(0, 0, 0, 0.2)', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border-light)',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1.1rem' }}>{ex.category}</strong>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                          {ex.type}
                        </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>{ex.description}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{new Date(ex.date).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' })}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className={ex.type === 'income' ? 'text-success' : 'text-danger'} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {ex.type === 'income' ? '+' : '-'}₹{ex.amount}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                          className="hover-action"
                          onClick={() => openEditModal(ex)}
                          style={{ 
                              background: 'rgba(255,255,255,0.05)', 
                              border: 'none', 
                              color: 'var(--text-muted)', 
                              padding: '8px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer'
                          }}
                          title="Edit Transaction"
                      >
                          <Edit2 size={16} />
                      </button>
                      <button 
                          onClick={() => handleDelete(ex._id)} 
                          className="delete-btn"
                          style={{ 
                              background: 'transparent', 
                              color: 'var(--text-danger)', 
                              fontSize: '1.2rem',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px',
                              cursor: 'pointer'
                          }}
                          title="Delete"
                      >
                          <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>

      {/* Mobile responsive style for transactions grid */}
      <style>{`
        @media (max-width: 768px) {
          .transactions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {editingTransaction && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', border: '1px solid var(--border-light)', margin: '0 16px' }}>
            <h2 style={{ marginTop: 0 }}>Edit Transaction</h2>
            <form onSubmit={handleUpdate}>
              <div className="responsive-flex-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                 <div style={{flex:1}}>
                  <label className="label">Type</label>
                  <select className="input-field" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label className="label">Amount</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={editForm.amount} 
                    onChange={e => setEditForm({...editForm, amount: e.target.value})} 
                    min="0.01"
                    step="0.01"
                    required 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="label">Category / Label</label>
                <input type="text" className="input-field" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="label">Date</label>
                <input 
                    type="date" 
                    className="input-field" 
                    value={editForm.date} 
                    onChange={e => setEditForm({...editForm, date: e.target.value})} 
                    max={new Date().toISOString().split('T')[0]}
                    required 
                    style={{ colorScheme: 'dark' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label">Description</label>
                <input type="text" className="input-field" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} required />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingTransaction(null)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Update Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <h2 style={{ color: 'white', fontWeight: 600 }}>Categorizing your transaction...</h2>
          <p className="text-muted">Analyzing details to find the right category</p>
        </div>
      )}
    </div>
  );
};

export default Transactions;
