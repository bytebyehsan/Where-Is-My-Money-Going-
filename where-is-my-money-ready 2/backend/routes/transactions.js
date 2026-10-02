const express = require("express");
const Transaction = require("../models/Transaction");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const items = await Transaction.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: "Could not load transactions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { type, title, amount, category, note, date } = req.body;

    if (!type || !title || !amount || !category) {
      return res.status(400).json({ message: "Type, title, amount and category are required" });
    }

    const item = await Transaction.create({
      user: req.user.id,
      type,
      title,
      amount: Number(amount),
      category,
      note: note || "",
      date: date || new Date()
    });

    res.status(201).json(item);
  } catch {
    res.status(500).json({ message: "Could not create transaction" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!item) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch {
    res.status(500).json({ message: "Could not delete transaction" });
  }
});

module.exports = router;
