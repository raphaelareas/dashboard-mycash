import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './contexts/FinanceContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Cards from './pages/Cards';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Goals from './pages/Goals';

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <FinanceProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/cartoes" element={<Cards />} />
                <Route path="/transacoes" element={<Transactions />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/metas" element={<Goals />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </FinanceProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
