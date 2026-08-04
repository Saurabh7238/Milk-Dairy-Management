import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [rates, setRates] = useState(null);
  const [cowRateInput, setCowRateInput] = useState('');
  const [buffaloRateInput, setBuffaloRateInput] = useState('');

  const fetchReport = async () => {
    try {
      const { data } = await api.get('/monthly-report', { params: { month, year } });
      setReport(data);
      setCowRateInput(data.cowRate || '');
      setBuffaloRateInput(data.buffaloRate || '');
    } catch (error) {
      toast.error('Unable to load report');
    }
  };

  const fetchRates = async () => {
    const { data } = await api.get('/monthly-rate');
    const matchedRate = data.find((r) => r.month === month && r.year === year);
    setRates(matchedRate || null);
    if (matchedRate) {
      setCowRateInput(matchedRate.cowRate);
      setBuffaloRateInput(matchedRate.buffaloRate);
    }
  };

  useEffect(() => {
    fetchReport();
    fetchRates();
  }, [month, year]);

  const saveMonthlyRate = async () => {
    try {
      await api.post('/monthly-rate', {
        month,
        year,
        cowRate: Number(cowRateInput || 0),
        buffaloRate: Number(buffaloRateInput || 0),
      });
      toast.success('Rates saved');
      fetchReport();
      fetchRates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save rates');
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Milk Dairy Management System - Monthly Report', 14, 15);
    autoTable(doc, {
      startY: 25,
      body: [
        ['Month', report?.monthName],
        ['Cow Milk Total', `${report?.cowMilkTotal ?? 0} kg`],
        ['Buffalo Milk Total', `${report?.buffaloMilkTotal ?? 0} kg`],
        ['Grand Milk Total', `${report?.grandMilkTotal ?? 0} kg`],
        ['Milk Income', `₹${report?.milkIncome ?? 0}`],
        ['Curd Income', `₹${report?.curdIncome ?? 0}`],
        ['Final Income', `₹${report?.finalIncome ?? 0}`],
      ],
    });
    doc.save(`report-${month}-${year}.pdf`);
  };

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { Month: report?.monthName, CowMilkTotal: report?.cowMilkTotal, BuffaloMilkTotal: report?.buffaloMilkTotal, GrandMilkTotal: report?.grandMilkTotal, MilkIncome: report?.milkIncome, CurdIncome: report?.curdIncome, FinalIncome: report?.finalIncome },
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `report-${month}-${year}.xlsx`);
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Monthly Report</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-2xl border px-4 py-3">
            {[...Array(12)].map((_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
          </select>
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-2xl border px-4 py-3" />
          <div className="rounded-2xl bg-slate-50 p-3 text-sm">
            <div>Cow cost: ₹<input type="number" min="0" value={cowRateInput} onChange={(e) => setCowRateInput(e.target.value)} className="mt-1 w-full rounded-xl border px-2 py-1" /></div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-sm">
            <div>Buffalo cost: ₹<input type="number" min="0" value={buffaloRateInput} onChange={(e) => setBuffaloRateInput(e.target.value)} className="mt-1 w-full rounded-xl border px-2 py-1" /></div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={saveMonthlyRate} className="rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 font-semibold text-white">Save Rates</button>
          <button onClick={printReport} className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white">Print</button>
        </div>
      </div>

      {report && (
        <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">Month Name: {report.monthName}</div>
            <div className="rounded-2xl bg-slate-50 p-4">Cow Milk Total: {report.cowMilkTotal} kg</div>
            <div className="rounded-2xl bg-slate-50 p-4">Buffalo Milk Total: {report.buffaloMilkTotal} kg</div>
            <div className="rounded-2xl bg-slate-50 p-4">Grand Milk Total: {report.grandMilkTotal} kg</div>
            <div className="rounded-2xl bg-slate-50 p-4">Cow Price: ₹{report.cowRate || rates?.cowRate || 0}</div>
            <div className="rounded-2xl bg-slate-50 p-4">Buffalo Price: ₹{report.buffaloRate || rates?.buffaloRate || 0}</div>
            <div className="rounded-2xl bg-slate-50 p-4">Milk Income: ₹{report.milkIncome}</div>
            <div className="rounded-2xl bg-slate-50 p-4">Curd Income: ₹{report.curdIncome}</div>
            <div className="rounded-2xl bg-slate-50 p-4">Final Income: ₹{report.finalIncome}</div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={downloadPDF} className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white">Download PDF</button>
            <button onClick={downloadExcel} className="rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white">Download Excel</button>
          </div>
        </div>
      )}
    </div>
  );
}
