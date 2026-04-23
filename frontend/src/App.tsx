import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PendingApprovalPage } from './pages/PendingApprovalPage';
import { CapacitacionesPage } from './pages/CapacitacionesPage';
import { CapacitacionDetailPage } from './pages/CapacitacionDetailPage';
import { UsersPage } from './pages/UsersPage';
import { Users, Building2, GraduationCap, LogOut, ChevronRight, Bell, Search, LayoutDashboard } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children, allowedStatus }: { children: React.ReactNode, allowedStatus: string[] }) => {
  const { user, loading, status } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-light">
        <h1 className="text-2xl font-bold text-primary animate-pulse">Cargando...</h1>
      </div>
    );
  }

  // Si no hay usuario, redireccionar al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no tiene el estatus permitido para esta ruta
  if (!allowedStatus.includes(status)) {
    return <Navigate to={status === 'pending_approval' ? "/pending" : "/"} replace />;
  }

  return <>{children}</>;
};

const DashboardLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const { user, logout, status } = useAuth();
  const navigate = useNavigate();



  return (
    <div className="flex h-screen w-full bg-light text-dark overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-dark flex flex-col shadow-2xl z-20">
        <div className="p-8 flex items-center gap-3 border-b border-white/5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LMS Elite</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Inicio" to="/" />
          {status === 'admin' && (
            <>
              <NavItem icon={<Users size={20} />} label="Usuarios" to="/users" />
              <NavItem icon={<Building2 size={20} />} label="Empresas" to="/empresas" />
            </>
          )}
          <NavItem icon={<GraduationCap size={20} />} label="Capacitaciones" to="/capacitaciones" />
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5 overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${user?.username}&background=64adcb&color=fff`} alt="User" className="rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.username}</p>
              <p className="text-[10px] text-gray-dark uppercase tracking-widest">{user?.rol?.nombre || 'Miembro'}</p>
            </div>
          </div>
          <button 
            onClick={async () => await logout()}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-blue-gray/30 flex items-center justify-between px-8 z-10 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-dark">{title}</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-dark" size={16} />
              <input type="text" placeholder="Buscar..." className="bg-light border-none rounded-full py-2 pl-10 pr-4 text-xs w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="p-2 rounded-full bg-light text-gray-dark hover:text-primary transition-colors cursor-pointer relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-secondary rounded-full border border-white"></span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) => (
  <NavLink 
    to={to} 
    end={to === '/'}
    className={({ isActive }) => `
      w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all 
      ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-dark hover:text-white hover:bg-white/5'}
    `}
  >
    {icon} {label}
  </NavLink>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pending" element={
            <ProtectedRoute allowedStatus={['pending_approval']}>
              <PendingApprovalPage />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute allowedStatus={['admin', 'authenticated']}>
              <DashboardLayout title="Dashboard">
                <div className="max-w-4xl">
                  <h3 className="text-3xl font-black text-dark mb-4">¡Bienvenido de nuevo!</h3>
                  <p className="text-gray-dark text-lg leading-relaxed mb-8">
                    Has ingresado al sistema de gestión de aprendizaje Elite. Aquí podrás gestionar tus capacitaciones y progreso.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-blue-gray/20 group hover:border-primary transition-all cursor-pointer">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <GraduationCap className="text-primary" size={24} />
                      </div>
                      <h4 className="text-xl font-bold mb-2">Mis Cursos</h4>
                      <p className="text-gray-dark text-sm mb-6">Continúa con tus capacitaciones activas.</p>
                      <ChevronRight className="text-primary" />
                    </div>
                  </div>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Capacitaciones Routes */}
          <Route path="/capacitaciones" element={
            <ProtectedRoute allowedStatus={['admin', 'authenticated']}>
              <DashboardLayout title="Capacitaciones">
                <CapacitacionesPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/capacitaciones/:id" element={
            <ProtectedRoute allowedStatus={['admin', 'authenticated']}>
              <DashboardLayout title="Contenido de Capacitación">
                <CapacitacionDetailPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/users" element={
            <ProtectedRoute allowedStatus={['admin']}>
              <DashboardLayout title="Gestión de Usuarios">
                <UsersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/empresas" element={
            <ProtectedRoute allowedStatus={['admin']}>
              <DashboardLayout title="Gestión de Empresas">
                <div className="bg-white p-8 rounded-[40px] border border-blue-gray/20 shadow-xl">
                  <h3 className="text-2xl font-black text-dark mb-4">Gestión de Empresas</h3>
                  <p className="text-gray-dark">Esta sección está en desarrollo.</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
