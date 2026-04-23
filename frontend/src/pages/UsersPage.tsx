import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Users, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Search,
  Filter,
  X,
  Save,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface Role {
  id: number;
  documentId: string;
  nombre: string;
}

interface Company {
  id: number;
  documentId: string;
  nombre: string;
}

interface Solicitud {
  id: number;
  documentId: string;
  aprobado: boolean;
}

interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  rol: Role | null;
  empresa: Company | null;
  solicitud: Solicitud | null;
}

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    roleId: '', // We'll use numeric ID for users plugin compatibility
    companyId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, companiesRes] = await Promise.all([
        api.get('/users?populate[rol][populate]=*&populate[empresa][populate]=*&populate[solicitud][populate]=*'),
        api.get('/rols'),
        api.get('/empresas')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data.data || []);
      setCompanies(companiesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setUpdateError(null);
    setFormData({
      // For users plugin, numeric ID is often preferred for relations in v5 if documentId fails
      // We will try both or check common patterns.
      roleId: user.rol?.id?.toString() || '', 
      companyId: user.empresa?.id?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleApproveSolicitud = async () => {
    if (!selectedUser?.solicitud) return;
    setIsUpdating(true);
    setUpdateError(null);
    try {
      // Solicitudes is a standard content type, uses documentId
      await api.put(`/solicitudes/${selectedUser.solicitud.documentId}`, {
        data: { aprobado: true }
      });
      await fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error approving solicitud:', error);
      setUpdateError(error.response?.data?.error?.message || 'Error al aprobar solicitud. Verifica los permisos en Strapi.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    setUpdateError(null);
    try {
      // The users-permissions plugin (api/users) uses numeric ID in Strapi v5
      await api.put(`/users/${selectedUser.id}`, {
        rol: formData.roleId ? parseInt(formData.roleId) : null,
        empresa: formData.companyId ? parseInt(formData.companyId) : null
      });
      await fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      setUpdateError(error.response?.data?.error?.message || 'Error al actualizar usuario. Verifica los permisos de edición para el rol Administrador.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-blue-gray/20 shadow-xl shadow-blue-gray/5">
        <div>
          <h2 className="text-2xl font-black text-dark flex items-center gap-3">
            <Users className="text-primary" size={28} />
            Gestión de Usuarios
          </h2>
          <p className="text-gray-dark text-sm mt-1">Administra los accesos y roles de la plataforma.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-dark" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-light/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 pl-12 pr-6 text-sm w-full md:w-80 outline-none transition-all shadow-inner"
            />
          </div>
          <button onClick={fetchData} className="p-3 bg-light rounded-2xl text-gray-dark hover:text-primary hover:bg-primary/5 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[40px] border border-blue-gray/20 shadow-2xl shadow-blue-gray/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-light/30 border-b border-blue-gray/10">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-dark">Usuario</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-dark">Rol</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-dark">Empresa</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-dark">Estado</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-dark text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-gray/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-light/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-lg border border-primary/10">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-dark group-hover:text-primary transition-colors">{user.username}</p>
                        <div className="flex items-center gap-1.5 text-gray-dark text-xs mt-0.5">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className={user.rol ? 'text-secondary' : 'text-gray-dark'} />
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        user.rol?.nombre === 'administrador' 
                        ? 'bg-secondary/10 border-secondary/20 text-secondary' 
                        : 'bg-blue-gray/10 border-blue-gray/20 text-gray-dark'
                      }`}>
                        {user.rol?.nombre || 'Sin Rol'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-dark text-sm">
                      <Building2 size={16} className="text-primary/60" />
                      {user.empresa?.nombre || 'No asignada'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {user.solicitud ? (
                      <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
                        user.solicitud.aprobado ? 'text-green-500' : 'text-orange-500'
                      }`}>
                        {user.solicitud.aprobado ? (
                          <><CheckCircle2 size={16} /> Aprobado</>
                        ) : (
                          <><Clock size={16} /> Pendiente</>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-dark opacity-40">
                        <XCircle size={16} /> Sin Solicitud
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="p-2 text-gray-dark hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-blue-gray/20">
            <div className="p-8 border-b border-blue-gray/10 flex items-center justify-between bg-light/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-dark leading-tight">{selectedUser.username}</h3>
                  <p className="text-xs text-gray-dark font-bold uppercase tracking-widest">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {updateError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  {updateError}
                </div>
              )}

              {/* Approval Action */}
              {selectedUser.solicitud && !selectedUser.solicitud.aprobado && (
                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-orange-800 font-bold text-sm">Solicitud Pendiente</h4>
                    <p className="text-orange-600 text-xs">Este usuario está esperando aprobación.</p>
                  </div>
                  <button 
                    onClick={handleApproveSolicitud}
                    disabled={isUpdating}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                  >
                    {isUpdating ? <Clock size={14} className="animate-spin" /> : <UserCheck size={14} />}
                    Aprobar Ahora
                  </button>
                </div>
              )}

              {/* Assignment Form */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-dark ml-1">Asignar Rol</label>
                  <select 
                    value={formData.roleId}
                    onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                    className="w-full bg-light/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3.5 px-6 text-sm outline-none transition-all"
                  >
                    <option value="">Seleccionar Rol...</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id.toString()}>{role.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-dark ml-1">Asignar Empresa</label>
                  <select 
                    value={formData.companyId}
                    onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                    className="w-full bg-light/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3.5 px-6 text-sm outline-none transition-all"
                  >
                    <option value="">Seleccionar Empresa...</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id.toString()}>{company.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-8 bg-light/30 border-t border-blue-gray/10 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-dark hover:bg-white transition-all border border-transparent hover:border-blue-gray/20"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdateUser}
                disabled={isUpdating}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                {isUpdating ? <Clock size={18} className="animate-spin" /> : <Save size={18} />}
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
