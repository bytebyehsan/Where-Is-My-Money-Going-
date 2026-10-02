const express = require("express");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const protect = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ user: req.user.id, month });

    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const expenses = await Transaction.find({
      user: req.user.id,
      type: "expense",
      date: { $gte: start, $lt: end }
    });

    const result = budgets.map(b => ({
      ...b.toObject(),
      spent: expenses
        .filter(e => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0)
    }));

    res.json(result);
  } catch {
    res.status(500).json({ message: "Could not load budgets" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { category, amount, month } = req.body;
    if (!category || !amount || !month) {
      return res.status(400).json({ message: "Category, amount and month are required" });
    }

    const item = await Budget.findOneAndUpdate(
      { user: req.user.id, category, month },
      { amount: Number(amount) },
      { upsert: true, new: true }
    );

    res.json(item);
  } catch {
    res.status(500).json({ message: "Could not save budget" });
  }
});

module.exports = router;
