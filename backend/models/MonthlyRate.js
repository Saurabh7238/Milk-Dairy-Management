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
  },
  { timestamps: true },
);

monthlyRateSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyRate', monthlyRateSchema);
