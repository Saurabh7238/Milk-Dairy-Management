import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const emptyBuyer = { name: '', phone: '', address: '', notes: '', rate: '' };
const emptySale = { buyerId: '', date: new Date().toISOString().slice(0, 10), quantity: '', rate: '', remarks: '' };

export default function BuyersPage() {
  const [buyers, setBuyers] = useState([]);
  const [sales, setSales] = useState([]);
  const [buyerForm, setBuyerForm] = useState(emptyBuyer);
  const [saleForm, setSaleForm] = useState(emptySale);
  const [editingBuyerId, setEditingBuyerId] = useState(null);

  const fetchData = async () => {
    const [buyersRes, salesRes] = await Promise.all([api.get('/buyers'), api.get('/sales')]);
    setBuyers(buyersRes.data);
    setSales(salesRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitBuyer = async (e) => {
    e.preventDefault();
    try {
      if (editingBuyerId) {
        await api.put(`/buyers/${editingBuyerId}`, buyerForm);
        toast.success('Buyer updated');
      } else {
        await api.post('/buyers', buyerForm);
        toast.success('Buyer added');
      }
      setBuyerForm(emptyBuyer);
      setEditingBuyerId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save buyer');
    }
  };

  const submitSale = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sales', { ...saleForm, quantity: Number(saleForm.quantity || 0), rate: Number(saleForm.rate || 0) });
      toast.success('Sale saved');
      setSaleForm(emptySale);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save sale');
    }
  };

  const editBuyer = (buyer) => {
    setBuyerForm({
      name: buyer.name,
      phone: buyer.phone,
      address: buyer.address || '',
      notes: buyer.notes || '',
      rate: buyer.rate ?? '',
    });
    setEditingBuyerId(buyer._id);
  };

  const deleteBuyer = async (id) => {
    if (!window.confirm('Delete buyer and linked sales?')) return;
    try {
      await api.delete(`/buyers/${id}`);
      toast.success('Buyer deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete buyer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Buyers</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitBuyer}>
          <label><span className="mb-1 block text-sm font-semibold">Name</span><input value={buyerForm.name} onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })} className="w-full rounded-2xl border px-4 py-3" required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Phone</span><input value={buyerForm.phone} onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })} className="w-full rounded-2xl border px-4 py-3" required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Address</span><input value={buyerForm.address} onChange={(e) => setBuyerForm({ ...buyerForm, address: e.target.value })} className="w-full rounded-2xl border px-4 py-3" /></label>
          <label><span className="mb-1 block text-sm font-semibold">Rate</span><input type="number" min="0" value={buyerForm.rate} onChange={(e) => setBuyerForm({ ...buyerForm, rate: e.target.value })} className="w-full rounded-2xl border px-4 py-3" /></label>
          <label><span className="mb-1 block text-sm font-semibold">Notes</span><input value={buyerForm.notes} onChange={(e) => setBuyerForm({ ...buyerForm, notes: e.target.value })} className="w-full rounded-2xl border px-4 py-3" /></label>
          <div className="flex gap-3 md:col-span-2"><button className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white">{editingBuyerId ? 'Update Buyer' : 'Add Buyer'}</button>{editingBuyerId ? <button type="button" onClick={() => { setBuyerForm(emptyBuyer); setEditingBuyerId(null); }} className="rounded-2xl bg-slate-200 px-4 py-3 font-semibold text-slate-800">Cancel</button> : null}</div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Buyer List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-slate-100 text-left"><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Address</th><th className="p-3">Rate</th><th className="p-3">Action</th></tr></thead>
            <tbody>{buyers.map((buyer) => <tr key={buyer._id} className="border-b"><td className="p-3">{buyer.name}</td><td className="p-3">{buyer.phone}</td><td className="p-3">{buyer.address || '-'}</td><td className="p-3">₹{buyer.rate ?? 0}</td><td className="p-3"><div className="flex gap-2"><button onClick={() => editBuyer(buyer)} className="rounded-lg bg-sky-600 px-3 py-1 text-white">Edit</button><button onClick={() => deleteBuyer(buyer._id)} className="rounded-lg bg-rose-600 px-3 py-1 text-white">Delete</button></div></td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Milk Sales</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitSale}>
          <label><span className="mb-1 block text-sm font-semibold">Buyer</span><select value={saleForm.buyerId} onChange={(e) => setSaleForm({ ...saleForm, buyerId: e.target.value })} className="w-full rounded-2xl border px-4 py-3" required><option value="">Select buyer</option>{buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyer.name}</option>)}</select></label>
          <label><span className="mb-1 block text-sm font-semibold">Date</span><input type="date" value={saleForm.date} onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })} className="w-full rounded-2xl border px-4 py-3" required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Quantity (L)</span><input type="number" min="0" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })} className="w-full rounded-2xl border px-4 py-3" required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Rate</span><input type="number" min="0" value={saleForm.rate} onChange={(e) => setSaleForm({ ...saleForm, rate: e.target.value })} className="w-full rounded-2xl border px-4 py-3" required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Remarks</span><input value={saleForm.remarks} onChange={(e) => setSaleForm({ ...saleForm, remarks: e.target.value })} className="w-full rounded-2xl border px-4 py-3" /></label>
          <button className="rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white md:col-span-2">Save Sale</button>
        </form>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Sales List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-slate-100 text-left"><th className="p-3">Buyer</th><th className="p-3">Date</th><th className="p-3">Qty</th><th className="p-3">Rate</th><th className="p-3">Amount</th></tr></thead>
            <tbody>{sales.map((sale) => <tr key={sale._id} className="border-b"><td className="p-3">{sale.buyerId?.name || '-'}</td><td className="p-3">{new Date(sale.date).toLocaleDateString()}</td><td className="p-3">{sale.quantity}</td><td className="p-3">₹{sale.rate}</td><td className="p-3">₹{sale.amount}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
