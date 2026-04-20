const STORAGE_KEYS = {
    EXPENSES: 'demo_expenses',
    BUDGET: 'demo_budget',
    AI_COUNT: 'demo_ai_count'
};

const INITIAL_EXPENSES = [
    { _id: 'd1', amount: 450, description: 'Starbucks Coffee', type: 'expense', category: 'Food', date: new Date().toISOString() },
    { _id: 'd2', amount: 2200, description: 'Grocery Shopping', type: 'expense', category: 'Groceries', date: new Date().toISOString() },
    { _id: 'd3', amount: 1500, description: 'Uber Ride', type: 'expense', category: 'Transport', date: new Date().toISOString() },
    { _id: 'd4', amount: 45000, description: 'Monthly Salary', type: 'income', category: 'Salary', date: new Date().toISOString() },
    { _id: 'd5', amount: 1200, description: 'Netflix Subscription', type: 'expense', category: 'Entertainment', date: new Date().toISOString() },
];

const INITIAL_BUDGET = { monthlyLimit: 15000 };

/**
 * Demo Service
 * Handles CRUD operations in localStorage for the "Demo Instance"
 */
export const demoService = {
    // --- Expenses ---
    getExpenses: () => {
        const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
            return INITIAL_EXPENSES;
        }
        return JSON.parse(stored);
    },

    addExpense: (expense) => {
        const expenses = demoService.getExpenses();
        const newExpense = {
            ...expense,
            _id: `d-${Date.now()}`,
            category: expense.category || 'Other' // Simulated AI categorization
        };
        const updated = [newExpense, ...expenses];
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
        return newExpense;
    },

    updateExpense: (id, updatedData) => {
        const expenses = demoService.getExpenses();
        const updated = expenses.map(ex => ex._id === id ? { ...ex, ...updatedData } : ex);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
        return updated.find(ex => ex._id === id);
    },

    deleteExpense: (id) => {
        const expenses = demoService.getExpenses();
        const updated = expenses.filter(ex => ex._id !== id);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
        return true;
    },

    // --- Budget ---
    getBudget: () => {
        const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(INITIAL_BUDGET));
            return INITIAL_BUDGET;
        }
        return JSON.parse(stored);
    },

    setBudget: (monthlyLimit) => {
        const updated = { monthlyLimit };
        localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(updated));
        return updated;
    },

    // --- AI Quota ---
    getAiCount: () => {
        const stored = localStorage.getItem(STORAGE_KEYS.AI_COUNT);
        return stored ? parseInt(stored, 10) : 0;
    },

    incrementAiCount: () => {
        const current = demoService.getAiCount();
        const updated = current + 1;
        localStorage.setItem(STORAGE_KEYS.AI_COUNT, updated.toString());
        return updated;
    },

    // --- Analytics Helpers (Mocking aggregation endpoints) ---
    getSummary: () => {
        const expenses = demoService.getExpenses();
        const budget = demoService.getBudget();
        
        const totalExpense = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
        const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
        
        const categoryTotals = expenses.filter(e => e.type === 'expense').reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
            return acc;
        }, {});

        return {
            totalExpense,
            totalIncome,
            balance: totalIncome - totalExpense,
            categoryTotals,
            budgetLimit: budget.monthlyLimit
        };
    }
};
