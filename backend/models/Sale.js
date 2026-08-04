const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
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
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Sale', saleSchema);
