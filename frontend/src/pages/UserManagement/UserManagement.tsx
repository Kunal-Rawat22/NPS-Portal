import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, deactivateUser, importUsers, importUserHierarchy, CreateUserPayload } from '../../api/users';
import { getBusinessUnits } from '../../api/businessUnits';
import { Plus, UserX, Search, Upload, Users } from 'lucide-react';
import { Role } from '../../types';
import UserImportModal from '../../components/UserManagement/UserImportModal';
import {
  parseUserImportFile,
  parseHierarchyImportFile,
  USER_IMPORT_TEMPLATE,
  HIERARCHY_IMPORT_TEMPLATE,
} from '../../utils/spreadsheetParser';

const ROLES: Role[] = ['ADMIN', 'BU_HEAD', 'HRBP', 'EMPLOYEE'];

type ImportModalMode = 'users' | 'hierarchy' | null;

const UserManagement: React.FC = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [importModal, setImportModal] = useState<ImportModalMode>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<CreateUserPayload>({ email: '', firstName: '', lastName: '', role: 'EMPLOYEE' });
  const [error, setError] = useState('');

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const { data: bus = [] } = useQuery({ queryKey: ['business-units'], queryFn: getBusinessUnits });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); setForm({ email: '', firstName: '', lastName: '', role: 'EMPLOYEE' }); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create user'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700', BU_HEAD: 'bg-blue-100 text-blue-700',
    HRBP: 'bg-purple-100 text-purple-700', EMPLOYEE: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">{users.filter(u => u.isActive).length} active users</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setImportModal('users')} className="btn-secondary flex items-center gap-2">
            <Upload size={18} /> Import Users
          </button>
          <button onClick={() => setImportModal('hierarchy')} className="btn-secondary flex items-center gap-2">
            <Users size={18} /> Map HRBP & RM
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Add New User</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label className="label">First Name *</label><input className="input" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} /></div>
            <div><label className="label">Last Name *</label><input className="input" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} /></div>
            <div><label className="label">Role *</label>
              <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div><label className="label">Business Unit</label>
              <select className="input" value={form.businessUnitId || ''} onChange={e => setForm(p => ({ ...p, businessUnitId: e.target.value || undefined }))}>
                <option value="">None</option>
                {bus.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div><label className="label">Competency</label><input className="input" placeholder="e.g. Java, JavaScript" value={form.competency || ''} onChange={e => setForm(p => ({ ...p, competency: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)} className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create User'}
            </button>
            <button onClick={() => { setShowForm(false); setError(''); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input className="input pl-10" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Business Unit</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-medium">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{u.email}</td>
                    <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[u.role]}`}>{u.role.replace('_', ' ')}</span></td>
                    <td className="py-3 text-gray-600">{u.businessUnitName || '—'}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      {u.isActive && (
                        <button onClick={() => { if (confirm('Deactivate this user?')) deactivateMutation.mutate(u.id); }} className="text-red-400 hover:text-red-600">
                          <UserX size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserImportModal
        open={importModal === 'users'}
        mode="users"
        title="Import Users"
        description="Upload a CSV or Excel file with user details. Existing users are updated by email."
        template={USER_IMPORT_TEMPLATE}
        columns={['Name', 'Email', 'Role', 'Business Unit', 'Status']}
        onClose={() => setImportModal(null)}
        onParse={parseUserImportFile}
        onImport={(rows) => importUsers(rows.map(r => ({
          name: r.name,
          email: r.email,
          role: r.role,
          businessUnit: r.businessUnit || undefined,
          status: r.status || undefined,
        })))}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['users'] })}
      />

      <UserImportModal
        open={importModal === 'hierarchy'}
        mode="hierarchy"
        title="Map HRBP & Reporting Manager"
        description="Upload a CSV or Excel file to link users with their HRBP and RM using email addresses."
        template={HIERARCHY_IMPORT_TEMPLATE}
        columns={['Email', 'HRBP Email', 'RM Email']}
        onClose={() => setImportModal(null)}
        onParse={parseHierarchyImportFile}
        onImport={(rows) => importUserHierarchy(rows.map(r => ({
          email: r.email,
          hrbpEmail: r.hrbpEmail || undefined,
          rmEmail: r.rmEmail || undefined,
        })))}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['users'] })}
      />
    </div>
  );
};

export default UserManagement;
