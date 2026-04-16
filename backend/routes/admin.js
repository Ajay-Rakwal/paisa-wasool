const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { User, Expense, Feedback } = require('../models');

const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:5001';

// --- STATS & CORRECTIONS ---

router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalTransactions, totalCorrections] = await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      Expense.countDocuments({ isUserCorrected: true, isTrained: false })
    ]);
    res.json({ totalUsers, totalTransactions, totalCorrections, modelAccuracy: null });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/corrections', adminAuth, async (req, res) => {
  try {
    const corrections = await Expense.find({ isUserCorrected: true, isTrained: false })
      .populate('userId', 'username email')
      .sort({ updatedAt: -1 }).limit(200);
    res.json(corrections);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/retrain', adminAuth, async (req, res) => {
  try {
    const { correctionIds } = req.body;
    let query = { isUserCorrected: true, isTrained: false };
    if (correctionIds?.length) query._id = { $in: correctionIds };
    const corrections = await Expense.find(query);
    if (!corrections.length) return res.status(400).json({ message: 'No corrections found' });

    const trainingData = corrections.map(c => ({ description: c.description, category: c.category }));
    const mlRes = await fetch(`${ML_SERVER_URL}/retrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corrections: trainingData })
    });
    const result = await mlRes.json();
    if (result.success) {
      await Expense.updateMany({ _id: { $in: corrections.map(c => c._id) } }, { isTrained: true });
      res.json({ message: 'Retrained successfully', accuracy: result.accuracy });
    } else res.status(500).json({ message: 'Retraining failed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrain' });
  }
});

router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const txCounts = await Expense.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]);
    const countMap = {};
    txCounts.forEach(t => { countMap[t._id.toString()] = t.count; });
    res.json(users.map(u => ({ ...u.toObject(), transactionCount: countMap[u._id.toString()] || 0 })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- FEEDBACK & SUPPORT ---

const migrateLegacyFeedback = async (feedback) => {
  if (feedback.conversations?.length > 0 || !feedback.message) return feedback;
  feedback.conversations = [{ sender: 'user', message: feedback.message, timestamp: feedback.createdAt }];
  if (feedback.adminReply) feedback.conversations.push({ sender: 'admin', message: feedback.adminReply, timestamp: feedback.repliedAt || feedback.updatedAt });
  await feedback.save();
  return feedback;
};

router.post('/feedback', auth, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'Missing fields' });
    const feedback = new Feedback({
      userId: req.user.id,
      subject,
      conversations: [{ sender: 'user', message, timestamp: new Date() }]
    });
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/feedback', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(await Promise.all(feedbacks.map(f => migrateLegacyFeedback(f))));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/feedback/all', adminAuth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('userId', 'username email').sort({ updatedAt: -1 });
    res.json(await Promise.all(feedbacks.map(f => migrateLegacyFeedback(f))));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/feedback/:id/reply', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Not found' });
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && feedback.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    
    await migrateLegacyFeedback(feedback);
    feedback.conversations.push({ sender: isAdmin ? 'admin' : 'user', message, timestamp: new Date() });
    if (isAdmin && feedback.status === 'pending') feedback.status = 'reviewed';
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/feedback/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (req.user.role !== 'admin' && feedback.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    feedback.status = status;
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/feedback/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (req.user.role !== 'admin' && feedback.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    await Feedback.deleteOne({ _id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
