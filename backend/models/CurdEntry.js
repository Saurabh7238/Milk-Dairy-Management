const mongoose = require('mongoose');

const curdEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    rate: {
      type: Number,
      required: true,
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

curdEntrySchema.index({ date: 1, userId: 1, buyerId: 1 }, { unique: true });

module.exports = mongoose.model('CurdEntry', curdEntrySchema);
