const MilkEntry = require('../models/MilkEntry');
const CurdEntry = require('../models/CurdEntry');
const MonthlyRate = require('../models/MonthlyRate');
const dayjs = require('dayjs');

const getDashboard = async (req, res, next) => {
  try {
    const today = dayjs().startOf('day');
    const monthStart = dayjs().startOf('month').toDate();
    const monthEnd = dayjs().endOf('month').toDate();

    const todayEntries = await MilkEntry.find({
      date: {
        $gte: today.toDate(),
        $lt: today.add(1, 'day').toDate(),
      },
    });

    const monthlyEntries = await MilkEntry.find({
      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    });

    const monthlyCurd = await CurdEntry.find({
      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    });

    const cowToday = todayEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0), 0);
    const buffaloToday = todayEntries.reduce((sum, item) => sum + Number(item.buffaloTotal || 0), 0);
    const totalToday = cowToday + buffaloToday;
    const monthMilkTotal = monthlyEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0) + Number(item.buffaloTotal || 0), 0);
    const curdIncome = monthlyCurd.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const rates = await MonthlyRate.findOne({ month: dayjs().month() + 1, year: dayjs().year() });
    const cowRate = rates?.cowRate || 0;
    const buffaloRate = rates?.buffaloRate || 0;
    const milkIncome = monthlyEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0) * cowRate + Number(item.buffaloTotal || 0) * buffaloRate, 0);

    res.json({
      today: {
        cowMilk: cowToday,
        buffaloMilk: buffaloToday,
        totalMilk: totalToday,
      },
      month: {
        totalMilk: monthMilkTotal,
        totalIncome: milkIncome,
        curdIncome,
      },
      monthlyRates: rates || null,
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const monthNumber = Number(month);
    const yearNumber = Number(year);

    const monthStart = dayjs(`${yearNumber}-${monthNumber}-01`).startOf('month').toDate();
    const monthEnd = dayjs(`${yearNumber}-${monthNumber}-01`).endOf('month').toDate();

    const milkEntries = await MilkEntry.find({
      date: { $gte: monthStart, $lte: monthEnd },
    }).sort({ date: 1 });

    const curdEntries = await CurdEntry.find({
      date: { $gte: monthStart, $lte: monthEnd },
    });

    const monthlyRate = await MonthlyRate.findOne({ month: monthNumber, year: yearNumber });

    const cowMilkTotal = milkEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0), 0);
    const buffaloMilkTotal = milkEntries.reduce((sum, item) => sum + Number(item.buffaloTotal || 0), 0);
    const grandMilkTotal = cowMilkTotal + buffaloMilkTotal;
    const cowRate = monthlyRate?.cowRate || 0;
    const buffaloRate = monthlyRate?.buffaloRate || 0;
    const milkIncome = cowMilkTotal * cowRate + buffaloMilkTotal * buffaloRate;
    const curdIncome = curdEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const finalIncome = milkIncome + curdIncome;

    res.json({
      monthName: dayjs(`${yearNumber}-${monthNumber}-01`).format('MMMM'),
      cowMilkTotal,
      buffaloMilkTotal,
      grandMilkTotal,
      cowRate,
      buffaloRate,
      milkIncome,
      curdIncome,
      finalIncome,
    });
  } catch (error) {
    next(error);
  }
};

const createMonthlyRate = async (req, res, next) => {
  try {
    const { month, year, cowRate, buffaloRate } = req.body;

    const rate = await MonthlyRate.findOneAndUpdate(
      { month, year },
      { month, year, cowRate, buffaloRate },
      { upsert: true, new: true, runValidators: true },
    );

    res.status(201).json(rate);
  } catch (error) {
    next(error);
  }
};

const getMonthlyRates = async (req, res, next) => {
  try {
    const rates = await MonthlyRate.find().sort({ year: -1, month: -1 });
    res.json(rates);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getMonthlyReport, createMonthlyRate, getMonthlyRates };
