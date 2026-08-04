import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  buyerId: '',
  cowMorning: '',
  cowEvening: '',
  buffaloMorning: '',
  buffaloEvening: '',
  remarks: '',
};

const convertToKg = (value, unit) => {
  if (!value && value !== 0) return 0;
  return unit === 'pao' ? Number(value) * 0.25 : Number(value);
};

export default function MilkEntryPage() {
  const [form, setForm] = useState(initialForm);
  const [entries, setEntries] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [unit, setUnit] = useState('kg');
  const [editingId, setEditingId] = useState(null);

  const cowTotal = useMemo(() => convertToKg(form.cowMorning || 0, unit) + convertToKg(form.cowEvening || 0, unit), [form.cowMorning, form.cowEvening, unit]);
  const buffaloTotal = useMemo(() => convertToKg(form.buffaloMorning || 0, unit) + convertToKg(form.buffaloEvening || 0, unit), [form.buffaloMorning, form.buffaloEvening, unit]);

  const getEntries = async () => {
    const { data } = await api.get('/milk');
    setEntries(data);
  };

  const getBuyers = async () => {
    const { data } = await api.get('/buyers');
    setBuyers(data);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setUnit('kg');
  };

  useEffect(() => {
    getEntries();
    getBuyers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      date: new Date(entry.date).toISOString().slice(0, 10),
      buyerId: entry.buyerId?._id || '',
      cowMorning: entry.cowMorning,
      cowEvening: entry.cowEvening,
      buffaloMorning: entry.buffaloMorning,
      buffaloEvening: entry.buffaloEvening,
      remarks: entry.remarks || '',
    });
    setUnit('kg');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this milk entry?')) return;
    try {
      await api.delete(`/milk/${id}`);
      toast.success('Milk entry deleted');
      getEntries();
      if (editingId === id) resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete entry');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        cowMorning: convertToKg(form.cowMorning, unit),
        cowEvening: convertToKg(form.cowEvening, unit),
        buffaloMorning: convertToKg(form.buffaloMorning, unit),
        buffaloEvening: convertToKg(form.buffaloEvening, unit),
      };

      if (editingId) {
        await api.put(`/milk/${editingId}`, payload);
        toast.success('Milk entry updated');
      } else {
        await api.post('/milk', payload);
        toast.success(`Milk entry saved in ${unit === 'pao' ? 'pao' : 'kg'}`);
      }

      resetForm();
      getEntries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save entry');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">{editingId ? 'Edit Milk Entry' : 'Milk Entry'}</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label><span className="mb-1 block text-sm font-semibold">Buyer</span>
            <select name="buyerId" value={form.buyerId} onChange={handleChange} className="w-full rounded-2xl border px-4 py-3" required>
              <option value="">Select buyer</option>
              {buyers.map((buyer) => (
                <option key={buyer._id} value={buyer._id}>{buyer.name}</option>
              ))}
            </select>
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Date</span><input name="date" type="date" className="w-full rounded-2xl border px-4 py-3" value={form.date} onChange={handleChange} required /></label>
          <label><span className="mb-1 block text-sm font-semibold">Quantity Unit</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full rounded-2xl border px-4 py-3">
              <option value="kg">Kilogram (kg)</option>
              <option value="pao">Quarter / Pao</option>
            </select>
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Cow Morning ({unit === 'pao' ? 'pao' : 'kg'})</span><input name="cowMorning" type="number" min="0" className="w-full rounded-2xl border px-4 py-3" value={form.cowMorning} onChange={handleChange} /></label>
          <label><span className="mb-1 block text-sm font-semibold">Cow Evening ({unit === 'pao' ? 'pao' : 'kg'})</span><input name="cowEvening" type="number" min="0" className="w-full rounded-2xl border px-4 py-3" value={form.cowEvening} onChange={handleChange} /></label>
          <label><span className="mb-1 block text-sm font-semibold">Buffalo Morning ({unit === 'pao' ? 'pao' : 'kg'})</span><input name="buffaloMorning" type="number" min="0" className="w-full rounded-2xl border px-4 py-3" value={form.buffaloMorning} onChange={handleChange} /></label>
          <label><span className="mb-1 block text-sm font-semibold">Buffalo Evening ({unit === 'pao' ? 'pao' : 'kg'})</span><input name="buffaloEvening" type="number" min="0" className="w-full rounded-2xl border px-4 py-3" value={form.buffaloEvening} onChange={handleChange} /></label>
          <label><span className="mb-1 block text-sm font-semibold">Notes</span><input name="remarks" className="w-full rounded-2xl border px-4 py-3" value={form.remarks} onChange={handleChange} /></label>
          <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
            <div className="grid gap-3 md:grid-cols-2">
              <div>Cow Total: {cowTotal.toFixed(2)} kg</div>
              <div>Buffalo Total: {buffaloTotal.toFixed(2)} kg</div>
            </div>
            <div className="mt-2 text-xs text-slate-500">Note: 1 pao / quarter = 0.25 kg.</div>
          </div>
          <div className="flex gap-3 md:col-span-2">
            <button className="rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 font-semibold text-white">{editingId ? 'Update Entry' : 'Save Entry'}</button>
            {editingId ? <button type="button" onClick={resetForm} className="rounded-2xl bg-slate-200 px-4 py-3 font-semibold text-slate-800">Cancel</button> : null}
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Recent Entries</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Cow Total</th>
                <th className="p-3">Buffalo Total</th>
                <th className="p-3">Remarks</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id} className="border-b">
                  <td className="p-3">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="p-3">{entry.cowTotal}</td>
                  <td className="p-3">{entry.buffaloTotal}</td>
                  <td className="p-3">{entry.remarks || '-'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(entry)} className="rounded-lg bg-sky-600 px-3 py-1 text-white">Edit</button>
                      <button type="button" onClick={() => handleDelete(entry._id)} className="rounded-lg bg-rose-600 px-3 py-1 text-white">Delete</button>
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
