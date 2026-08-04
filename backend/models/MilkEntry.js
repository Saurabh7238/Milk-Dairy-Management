const mongoose = require('mongoose');

const milkEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    cowMorning: {
      type: Number,
      default: 0,
      min: 0,
    },
    cowEvening: {
      type: Number,
      default: 0,
      min: 0,
    },
    cowTotal: {
      type: Number,
      default: 0,
    },
    buffaloMorning: {
      type: Number,
      default: 0,
      min: 0,
    },
    buffaloEvening: {
      type: Number,
      default: 0,
      min: 0,
    },
    buffaloTotal: {
      type: Number,
      default: 0,
    },
    rate: {
      type: Number,
      default: 0,
      min: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

milkEntrySchema.index({ date: 1, userId: 1, buyerId: 1 }, { unique: true });

module.exports = mongoose.model('MilkEntry', milkEntrySchema);
