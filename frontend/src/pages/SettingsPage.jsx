import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function SettingsPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/change-password', form);
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to change password');
    }
  };

  return (
    <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-slate-900">Settings</h2>
      <form className="max-w-md space-y-4" onSubmit={handleSubmit}>
        <label><span className="mb-1 block text-sm font-semibold">Current Password</span><input type="password" className="w-full rounded-2xl border px-4 py-3" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required /></label>
        <label><span className="mb-1 block text-sm font-semibold">New Password</span><input type="password" className="w-full rounded-2xl border px-4 py-3" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required /></label>
        <button className="rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 font-semibold text-white">Change Password</button>
      </form>
    </div>
  );
}
