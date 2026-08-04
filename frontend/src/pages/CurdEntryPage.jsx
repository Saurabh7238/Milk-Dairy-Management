import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  buyerId: '',
  quantity: '',
  rate: '',
  remarks: '',
};

export default function CurdEntryPage() {
  const [form, setForm] = useState(initialForm);
  const [entries, setEntries] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [editingId, setEditingId] = useState(null);


  const fetchEntries = async () => {
    const { data } = await api.get('/curd');
    setEntries(data);
  };

  const fetchBuyers = async () => {
    const { data } = await api.get('/buyers');
    setBuyers(data);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  useEffect(() => {
    fetchEntries();
    fetchBuyers();
  }, []);

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      date: new Date(entry.date).toISOString().slice(0, 10),
      buyerId: entry.buyerId?._id || '',
      quantity: entry.quantity,
      rate: entry.rate,
      remarks: entry.remarks || '',
    });
  };

  const handleBuyerChange = (buyerId) => {
    setForm({
      ...form,
      buyerId,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this curd entry?')) return;
    try {
      await api.delete(`/curd/${id}`);
      toast.success('Curd entry deleted');
      fetchEntries();
      if (editingId === id) resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete curd entry');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/curd/${editingId}`, form);
        toast.success('Curd entry updated');
      } else {
        await api.post('/curd', form);
        toast.success('Curd entry saved');
      }
      resetForm();
      fetchEntries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save curd entry');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">{editingId ? 'Edit Curd Entry' : 'Curd Entry'}</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label><span className="mb-1 block text-sm font-semibold">Buyer</span>
            <select name="buyerId" value={form.buyerId} onChange={(e) => handleBuyerChange(e.target.value)} className="w-full rounded-2xl border px-4 py-3" required>
              <option value="">Select buyer</option>
              {buyers.map((buyer) => (
                <option key={buyer._id} value={buyer._id}>{buyer.name}</option>
              ))}
            </select>
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Date</span><input type="date" name="date" className="w-full rounded-2xl border px-4 py-3" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Curd Quantity (kg)</span><input type="number" min="0" name="quantity" className="w-full rounded-2xl border px-4 py-3" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Rate per kg (₹)</span><input type="number" min="0" step="0.01" name="rate" className="w-full rounded-2xl border px-4 py-3" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Notes</span><input type="text" name="remarks" className="w-full rounded-2xl border px-4 py-3" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></label>
          <div className="flex gap-3 md:col-span-2">
            <button className="rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 font-semibold text-white">{editingId ? 'Update Curd Entry' : 'Save Curd Entry'}</button>
            {editingId ? <button type="button" onClick={resetForm} className="rounded-2xl bg-slate-200 px-4 py-3 font-semibold text-slate-800">Cancel</button> : null}
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900">Curd Entries</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Rate</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Remarks</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id} className="border-b">
                  <td className="p-3">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="p-3">{entry.quantity}</td>
                  <td className="p-3">₹{entry.rate}</td>
                  <td className="p-3">₹{entry.amount?.toFixed?.(2) ?? entry.amount}</td>
                  <td className="p-3">{entry.remarks || '-'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(entry)} className="rounded-lg bg-sky-600 px-3 py-1 text-white">Edit</button>
                      <button onClick={() => handleDelete(entry._id)} className="rounded-lg bg-rose-600 px-3 py-1 text-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
