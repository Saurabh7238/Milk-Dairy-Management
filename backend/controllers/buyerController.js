const Buyer = require('../models/Buyer');
const Sale = require('../models/Sale');
const XLSX = require('xlsx');

const listBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(buyers);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load buyers' });
  }
};

const createBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.create({ ...req.body, userId: req.user.id });
    return res.status(201).json(buyer);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create buyer' });
  }
};

const updateBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
    return res.json(buyer);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update buyer' });
  }
};

const deleteBuyer = async (req, res) => {
  try {
    await Buyer.deleteOne({ _id: req.params.id, userId: req.user.id });
    await Sale.deleteMany({ buyerId: req.params.id, userId: req.user.id });
    return res.json({ message: 'Buyer deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete buyer' });
  }
};

const listSales = async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user.id }).populate('buyerId').sort({ date: -1 });
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load sales' });
  }
};

const createSale = async (req, res) => {
  try {
    const amount = Number(req.body.quantity || 0) * Number(req.body.rate || 0);
    const sale = await Sale.create({ ...req.body, userId: req.user.id, amount });
    return res.status(201).json(sale);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create sale' });
  }
};

const updateSale = async (req, res) => {
  try {
    const amount = Number(req.body.quantity || 0) * Number(req.body.rate || 0);
    const sale = await Sale.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { ...req.body, amount }, { new: true });
    return res.json(sale);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update sale' });
  }
};

const deleteSale = async (req, res) => {
  try {
    await Sale.deleteOne({ _id: req.params.id, userId: req.user.id });
    return res.json({ message: 'Sale deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete sale' });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user.id }).populate('buyerId').sort({ date: -1 });
    const totalQuantity = sales.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0);
    const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    const buyerCount = new Set(sales.map((sale) => sale.buyerId?._id?.toString())).size;

    return res.json({
      totalQuantity,
      totalAmount,
      buyerCount,
      sales,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load summary' });
  }
};

const exportSalesReport = async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user.id }).populate('buyerId').sort({ date: -1 });
    const rows = sales.map((sale) => ({
      Buyer: sale.buyerId?.name || '-',
      Phone: sale.buyerId?.phone || '-',
      Date: new Date(sale.date).toLocaleDateString(),
      Quantity: sale.quantity,
      Rate: sale.rate,
      Amount: sale.amount,
      Remarks: sale.remarks || '-',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.xlsx"');
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to export sales report' });
  }
};

module.exports = { listBuyers, createBuyer, updateBuyer, deleteBuyer, listSales, createSale, updateSale, deleteSale, getSalesSummary, exportSalesReport };
