const express = require('express');
const router = express.Router();
const { Expense, Budget, User } = require('../models');
const auth = require('../middleware/auth');
const Groq = require('groq-sdk');

const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:5001';

// Keyword-based fallback if ML server is unavailable
const KEYWORD_MAP = {
  food: 'food', restaurant: 'food', pizza: 'food', burger: 'food', coffee: 'food',
  zomato: 'food', swiggy: 'food', lunch: 'food', dinner: 'food', breakfast: 'food',
  grocery: 'food', milk: 'food', bread: 'food',
  uber: 'travel', ola: 'travel', flight: 'travel', train: 'travel', bus: 'travel',
  taxi: 'travel', petrol: 'travel', fuel: 'travel', metro: 'travel',
  netflix: 'entertainment', spotify: 'entertainment', movie: 'entertainment',
  cinema: 'entertainment', game: 'entertainment', concert: 'entertainment',
  amazon: 'shopping', flipkart: 'shopping', myntra: 'shopping', shopping: 'shopping',
  clothes: 'shopping', shoes: 'shopping',
  rent: 'rent', lease: 'rent', housing: 'rent',
  hospital: 'healthcare', doctor: 'healthcare', medicine: 'healthcare',
  pharmacy: 'healthcare', medical: 'healthcare',
  electricity: 'utilities', water: 'utilities', wifi: 'utilities', internet: 'utilities',
  phone: 'utilities', recharge: 'utilities', gas: 'utilities',
  tuition: 'education', course: 'education', book: 'education', school: 'education',
  college: 'education', udemy: 'education',
  emi: 'emi', loan: 'emi', installment: 'emi', credit: 'emi',
  sip: 'investment', mutual: 'investment', stock: 'investment', invest: 'investment',
  fd: 'investment'
};

function fallbackCategorize(description) {
  const lower = description.toLowerCase();
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'Other';
}

async function predictCategory(description) {
  try {
    const correctedMatch = await Expense.findOne({
      description: { $regex: new RegExp(`^${description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      isUserCorrected: true
    }).sort({ updatedAt: -1 });

    if (correctedMatch) return correctedMatch.category;
  } catch (e) {}

  try {
    const res = await fetch(`${ML_SERVER_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    if (res.ok) {
      const data = await res.json();
      return data.category || 'Other';
    }
    return fallbackCategorize(description);
  } catch (e) {
    return fallbackCategorize(description);
  }
}

// --- EXPENSES ROUTES ---

router.get('/expenses', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/expenses/summary', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};
    expenses.forEach(ex => {
      if (ex.type === 'income') {
        totalIncome += ex.amount;
      } else {
        totalExpense += ex.amount;
        categoryTotals[ex.category] = (categoryTotals[ex.category] || 0) + ex.amount;
      }
    });
    res.json({
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      categoryTotals,
      expenses
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/expenses', auth, async (req, res) => {
  if (req.user.email === 'demo@paisawasool.com') return res.status(403).json({ message: 'Disabled in Demo' });
  try {
    const { amount, description, type, date, category: manualCategory } = req.body;
    
    // Server-side validation
    if (Number(amount) <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });
    if (date && new Date(date) > new Date()) return res.status(400).json({ message: 'Future dates are not allowed' });

    let category = manualCategory || 'Other';
    if ((type === 'expense' || !type) && description && !manualCategory) {
      category = await predictCategory(description);
    } else if (!type && !manualCategory) {
        category = 'Income';
    }

    const newExpense = new Expense({
      userId: req.user.id,
      amount: Number(amount),
      category,
      originalCategory: category,
      description,
      type: type || 'expense',
      date: date || Date.now()
    });
    const saved = await newExpense.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/expenses/:id', auth, async (req, res) => {
  if (req.user.email === 'demo@paisawasool.com') return res.status(403).json({ message: 'Disabled in Demo' });
  try {
    const { category, amount, description, type, date } = req.body;
    const updateData = { category, amount, description, type, date };
    if (category) {
      const existing = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
      if (existing && existing.category !== category) {
        updateData.isUserCorrected = true;
        if (!existing.originalCategory) updateData.originalCategory = existing.category;
      }
    }
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updateData },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/expenses/:id', auth, async (req, res) => {
  if (req.user.email === 'demo@paisawasool.com') return res.status(403).json({ message: 'Disabled in Demo' });
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/expenses/insights', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id, type: 'expense' });
    if (!expenses.length) return res.json({ insights: ["Add more expenses to see insights!"] });

    const categoryStats = {};
    const dayStats = { weekday: 0, weekend: 0 };
    let totalSpend = 0;
    let minDate = expenses[0].date;
    let maxDate = expenses[0].date;

    expenses.forEach(ex => {
        totalSpend += ex.amount;
        categoryStats[ex.category] = (categoryStats[ex.category] || { amount: 0, count: 0 });
        categoryStats[ex.category].amount += ex.amount;
        categoryStats[ex.category].count += 1;
        const day = new Date(ex.date).getDay();
        if (day === 0 || day === 6) dayStats.weekend += ex.amount;
        else dayStats.weekday += ex.amount;
        if (ex.date < minDate) minDate = ex.date;
        if (ex.date > maxDate) maxDate = ex.date;
    });

    const weeksElapsed = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24 * 7)));
    const insights = [];
    const foodStats = categoryStats['Food'] || categoryStats['food'];
    if (foodStats && (foodStats.count / weeksElapsed) > 2) insights.push("You're a frequent foodie! Consider a weekly meal prep budget.");
    if (dayStats.weekend > dayStats.weekday) insights.push("Weekend spending spree detected. Try setting a 'Saturday Limit'.");
    if (totalSpend / weeksElapsed > 10000) insights.push("High weekly burn rate. Check for recurring subscriptions you don't use.");
    
    let dominantCategory = null;
    let maxSpending = 0;
    for (const [cat, stats] of Object.entries(categoryStats)) {
        if (stats.amount > maxSpending) { maxSpending = stats.amount; dominantCategory = cat; }
    }
    if (dominantCategory && (maxSpending / totalSpend) > 0.4) {
        insights.push(`Your spending is heavily concentrated in ${dominantCategory} (${((maxSpending/totalSpend)*100).toFixed(0)}%). Consider diversifying your lifestyle expenses.`);
    }
    if (insights.length < 2) insights.push("Financial habit: You maintain consistent spending patterns across categories.");
    if (!insights.length) insights.push("Spending is well balanced across your typical categories.");
    res.json({ insights });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- BUDGET ROUTES ---

router.get('/budget', auth, async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.user.id });
    if (!budget) {
      budget = new Budget({ userId: req.user.id, monthlyLimit: 0, categoryLimits: [] });
      await budget.save();
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/budget', auth, async (req, res) => {
  if (req.user.email === 'demo@paisawasool.com') return res.status(403).json({ message: 'Disabled in Demo' });
  try {
    const { monthlyLimit, categoryLimits } = req.body;
    let budget = await Budget.findOneAndUpdate(
      { userId: req.user.id },
      { monthlyLimit, categoryLimits: categoryLimits || [] },
      { new: true, upsert: true }
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- AI ADVISOR ---

const API_KEYS = [process.env.GROQ_API_KEY_1, process.env.GROQ_API_KEY_2, process.env.GROQ_API_KEY_3].filter(Boolean);
const clients = API_KEYS.map(key => new Groq({ apiKey: key }));
let currentKeyIndex = 0;

function getNextClient() {
  const client = clients[currentKeyIndex];
  const keyIndex = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % clients.length;
  return { client, keyIndex };
}

async function createChatWithFallback(messages, options) {
  let lastError = null;
  for (let attempt = 0; attempt < clients.length; attempt++) {
    const { client, keyIndex } = getNextClient();
    try {
      return await client.chat.completions.create({ messages, ...options });
    } catch (err) {
      lastError = err;
      if (err?.status === 429) continue;
      throw err;
    }
  }
  throw lastError;
}

router.post('/ai/advisor', auth, async (req, res) => {
  try {
    const { prompt, context } = req.body;
    let expenses = [];
    let budget = null;
    let totalExpense = 0;
    let categoryTotals = {};
    let budgetLimit = 'Not set';

    if (req.user.id === 'demo-user-id' && context) {
      // Use localized context from frontend
      totalExpense = context.totalExpense;
      categoryTotals = context.categoryTotals;
      budgetLimit = context.budgetLimit;
    } else {
      [expenses, budget] = await Promise.all([
        Expense.find({ userId: req.user.id, type: 'expense' }).sort({ date: -1 }).limit(20),
        Budget.findOne({ userId: req.user.id })
      ]);

      expenses.forEach(ex => {
        totalExpense += ex.amount;
        categoryTotals[ex.category] = (categoryTotals[ex.category] || 0) + ex.amount;
      });
      if (budget) budgetLimit = `₹${budget.monthlyLimit}`;
    }

    const systemPrompt = `You are an expert financial advisor. Keep responses short and practical. Use ₹ currency. 
    Context: Budget: ${budgetLimit}, Spent Recently: ₹${totalExpense}, Categories: ${JSON.stringify(categoryTotals)}.`;

    const stream = await createChatWithFallback(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt || "Financial health check." }],
      { model: 'llama-3.1-8b-instant', temperature: 0.6, max_tokens: 512, stream: true }
    );

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) res.write(content);
    }
    res.end();

    if (req.user.email === 'demo@paisawasool.com') {
      await User.findByIdAndUpdate(req.user.id, { $inc: { aiQueryCount: 1 } });
    }
  } catch (err) {
    if (!res.headersSent) res.status(err?.status === 429 ? 429 : 500).json({ message: 'AI Error' });
    else res.end();
  }
});

module.exports = router;
