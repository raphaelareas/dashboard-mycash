import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider, useI18n } from './contexts/I18nContext';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Success from './pages/Success';
import Dashboard from './pages/Dashboard';
import Cards from './pages/Cards';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import People from './pages/People';
import MyAccount from './pages/MyAccount';
import Settings from './pages/Settings';
import Categories from './pages/Categories';

// Componente para proteger rotas que requerem autenticação
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  // Mostrar loading apenas se ainda está verificando autenticação
  // Mas ter um timeout para evitar loading infinito
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Se não há usuário após loading, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutesInner() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/success" element={<Success />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cartoes"
        element={
          <ProtectedRoute>
            <Layout>
              <Cards />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contas"
        element={
          <ProtectedRoute>
            <Layout>
              <Accounts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transacoes"
        element={
          <ProtectedRoute>
            <Layout>
              <Transactions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pessoas"
        element={
          <ProtectedRoute>
            <Layout>
              <People />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/minha-conta"
        element={
          <ProtectedRoute>
            <Layout>
              <MyAccount />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categorias"
        element={
          <ProtectedRoute>
            <Layout>
              <Categories />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function AppRoutes() {
  return <AppRoutesInner />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <BrowserRouter>
            <SidebarProvider>
              <FinanceProvider>
                <AppRoutes />
              </FinanceProvider>
            </SidebarProvider>
          </BrowserRouter>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
