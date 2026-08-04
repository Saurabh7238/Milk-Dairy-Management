const mongoose = require('mongoose');

const monthlyRateSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    cowRate: {
      type: Number,
      required: true,
      min: 0,
    },
    buffaloRate: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      default: null,
    },
  },
  { timestamps: true },
);

monthlyRateSchema.index({ userId: 1, buyerId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyRate', monthlyRateSchema);
