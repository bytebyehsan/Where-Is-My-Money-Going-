const express = require("express");
const Transaction = require("../models/Transaction");
const protect = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/summary", async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: 1 });

    const income = transactions
      .filter(t => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    const categories = {};
    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    const categoryData = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, month: d.toLocaleString("en-US", { month: "short" }), income: 0, expense: 0 });
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const m = months.find(x => x.key === key);
      if (m) m[t.type] += t.amount;
    });

    const topCategory = categoryData[0]?.name || "No spending yet";
    const topAmount = categoryData[0]?.value || 0;

    res.json({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      categoryData,
      monthlyData: months,
      topCategory,
      topAmount,
      transactionCount: transactions.length
    });
  } catch {
    res.status(500).json({ message: "Could not calculate analytics" });
  }
});

module.exports = router;
