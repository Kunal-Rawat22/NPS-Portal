import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBusinessUnits, createBusinessUnit, updateBusinessUnit, deleteBusinessUnit } from '../../api/businessUnits';
import { getUsers } from '../../api/users';
import { BusinessUnit } from '../../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const BusinessUnitManagement: React.FC = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BusinessUnit | null>(null);
  const [form, setForm] = useState({ name: '', headUserId: '' });
  const [error, setError] = useState('');

  const { data: bus = [], isLoading } = useQuery({ queryKey: ['business-units'], queryFn: getBusinessUnits });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  const buHeads = users.filter(u => u.isActive && u.role === 'BU_HEAD');

  const resetForm = () => {
    setForm({ name: '', headUserId: '' });
    setEditing(null);
    setShowForm(false);
    setError('');
  };

  const createMutation = useMutation({
    mutationFn: createBusinessUnit,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business-units'] }); resetForm(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create business unit'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; headUserId?: string } }) => updateBusinessUnit(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business-units'] }); resetForm(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update business unit'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBusinessUnit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business-units'] }),
    onError: (e: any) => alert(e.response?.data?.message || 'Failed to delete business unit'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', headUserId: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (bu: BusinessUnit) => {
    setEditing(bu);
    setForm({ name: bu.name, headUserId: bu.headUserId || '' });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    const payload = { name: form.name.trim(), headUserId: form.headUserId || undefined };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Units</h1>
          <p className="text-gray-500 mt-1">{bus.length} business unit{bus.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Business Unit
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">{editing ? 'Edit Business Unit' : 'Add Business Unit'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">BU Head</label>
              <select className="input" value={form.headUserId} onChange={e => setForm(p => ({ ...p, headUserId: e.target.value }))}>
                <option value="">None</option>
                {buHeads.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
            <button onClick={resetForm} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : bus.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No business units yet. Add one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">BU Head</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bus.map(bu => (
                  <tr key={bu.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">{bu.name}</td>
                    <td className="py-3 text-gray-600">{bu.headUserName || '—'}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(bu)} className="text-gray-400 hover:text-primary-600">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete "${bu.name}"?`)) deleteMutation.mutate(bu.id); }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessUnitManagement;
