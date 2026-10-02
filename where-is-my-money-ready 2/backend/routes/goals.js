const express = require("express");
const Goal = require("../models/Goal");
const protect = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    res.json(await Goal.find({ user: req.user.id }).sort({ createdAt: -1 }));
  } catch {
    res.status(500).json({ message: "Could not load goals" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, deadline } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({ message: "Name and target amount are required" });
    }

    const goal = await Goal.create({
      user: req.user.id,
      name,
      targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount || 0),
      deadline: deadline || undefined
    });

    res.status(201).json(goal);
  } catch {
    res.status(500).json({ message: "Could not create goal" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { savedAmount: Number(req.body.savedAmount) },
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  } catch {
    res.status(500).json({ message: "Could not update goal" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Goal deleted" });
  } catch {
    res.status(500).json({ message: "Could not delete goal" });
  }
});

module.exports = router;
