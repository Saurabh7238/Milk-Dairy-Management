import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const emptyForm = { buyerId: '', date: new Date().toISOString().slice(0, 10), quantity: '', rate: '', remarks: '' };

export default function SalesPage() {
  const [buyers, setBuyers] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [buyersRes, salesRes, summaryRes] = await Promise.all([api.get('/buyers'), api.get('/sales'), api.get('/sales-summary')]);
      setBuyers(buyersRes.data);
      setSales(salesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Unable to load sales data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveSale = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sales', { ...form, quantity: Number(form.quantity || 0), rate: Number(form.rate || 0) });
      toast.success('Sale saved');
      setForm(emptyForm);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save sale');
    }
  };

  const handleBuyerChange = (buyerId) => {
    const selectedBuyer = buyers.find((buyer) => buyer._id === buyerId);
    setForm({
      ...form,
      buyerId,
      rate: selectedBuyer ? selectedBuyer.rate : '',
    });
  };

  const exportReport = async () => {
    try {
      const response = await api.get('/sales-export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Sales Dashboard</h2>
          <button onClick={exportReport} className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white">Export Excel</button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Total Quantity</div><div className="text-2xl font-bold">{summary?.totalQuantity ?? 0}</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Total Amount</div><div className="text-2xl font-bold">₹{summary?.totalAmount ?? 0}</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Buyers</div><div className="text-2xl font-bold">{summary?.buyerCount ?? 0}</div></div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Sell Milk to Buyer</h3>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveSale}>
          <label><span className="mb-1 block text-sm font-semibold">Buyer</span><select value={form.buyerId} onChange={(e) => handleBuyerChange(e.target.value)} className="w-full rounded-2xl border px-4 py-3" required><option value="">Select buyer</option>{buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyer.name}</option>)}</select></label>
          <label><span className="mb-1 block text-sm font-semibold">Date</span><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-2xl border px-4 py-3" required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Quantity (L)</span><input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full rounded-2xl border px-4 py-3" required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Rate</span><input type="number" min="0" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="w-full rounded-2xl border px-4 py-3" required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Remarks</span><input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="w-full rounded-2xl border px-4 py-3" /></label>
          <button className="rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white md:col-span-2">Save Sale</button>
        </form>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-slate-100 text-left"><th className="p-3">Buyer</th><th className="p-3">Date</th><th className="p-3">Qty</th><th className="p-3">Rate</th><th className="p-3">Amount</th><th className="p-3">Remarks</th></tr></thead>
            <tbody>{sales.map((sale) => <tr key={sale._id} className="border-b"><td className="p-3">{sale.buyerId?.name || '-'}</td><td className="p-3">{new Date(sale.date).toLocaleDateString()}</td><td className="p-3">{sale.quantity}</td><td className="p-3">₹{sale.rate}</td><td className="p-3">₹{sale.amount}</td><td className="p-3">{sale.remarks || '-'}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
