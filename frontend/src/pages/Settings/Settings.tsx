import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { Category } from '../../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const { data: categories = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setEditing(null);
    setShowForm(false);
    setError('');
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); resetForm(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description?: string } }) => updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); resetForm(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
    onError: (e: any) => alert(e.response?.data?.message || 'Failed to delete category'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    const payload = { name: form.name.trim(), description: form.description.trim() || undefined };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage survey question categories</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Survey Categories</h2>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
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
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No categories yet. Add one to use in survey questions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">{cat.name}</td>
                    <td className="py-3 text-gray-600">{cat.description || '—'}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-primary-600">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id); }}
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

export default Settings;
