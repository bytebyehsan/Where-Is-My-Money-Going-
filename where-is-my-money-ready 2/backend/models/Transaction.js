const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    note: { type: String, default: "" },
    date: { type: Date, required: true, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
