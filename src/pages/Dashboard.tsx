import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { IncomeCard } from '@/components/dashboard/IncomeCard';
import { ExpenseCard } from '@/components/dashboard/ExpenseCard';
import { ExpensesByCategoryGrid } from '@/components/dashboard/ExpensesByCategoryGrid';
import { FinancialFlowChart } from '@/components/dashboard/FinancialFlowChart';
import { CreditCardsWidget } from '@/components/dashboard/CreditCardsWidget';
import { UpcomingExpensesWidget } from '@/components/dashboard/UpcomingExpensesWidget';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { AddCardModal } from '@/components/modals/AddCardModal';
import { SuccessToast } from '@/components/ui/Toast/SuccessToast';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const toastShownRef = useRef(false);
  
  // Verificar query parameter na URL para mostrar toast de sucesso após login/signup
  useEffect(() => {
    // Só verificar se não está carregando autenticação e usuário está disponível
    if (authLoading) {
      console.log('⏳ Dashboard: Aguardando autenticação...');
      return;
    }

    if (!user) {
      console.log('❌ Dashboard: Usuário não autenticado');
      return;
    }

    // Evitar mostrar toast múltiplas vezes
    if (toastShownRef.current) {
      console.log('⚠️ Dashboard: Toast já foi mostrado anteriormente');
      return;
    }

    // Ler query parameter da URL
    const successType = searchParams.get('success');
    
    console.log('🔍 Dashboard: Verificando toast na URL:', { 
      successType, 
      user: user?.email,
      urlParams: Object.fromEntries(searchParams.entries()),
      urlCompleta: window.location.href
    });
    
    // Validar se o tipo é válido
    if (successType && (successType === 'signup' || successType === 'login')) {
      // Salvar o tipo ANTES de limpar (para garantir que não perdemos)
      const savedType = successType.trim().toLowerCase();
      
      console.log('📝 Dashboard: Tipo salvo antes de processar:', savedType);
      
      // Marcar como mostrado imediatamente para evitar duplicação
      toastShownRef.current = true;
      
      // Limpar query parameter da URL imediatamente
      searchParams.delete('success');
      setSearchParams(searchParams, { replace: true });
      
      // Definir mensagem baseada no tipo - IMPORTANTE: verificar signup PRIMEIRO
      let message = '';
      if (savedType === 'signup') {
        message = t('auth.signupSuccess');
        console.log('✅ Dashboard: Preparando toast de SIGNUP:', message, '| Tipo salvo:', savedType);
      } else if (savedType === 'login') {
        message = t('auth.loginSuccess');
        console.log('✅ Dashboard: Preparando toast de LOGIN:', message, '| Tipo salvo:', savedType);
      } else {
        console.warn('⚠️ Dashboard: Tipo de sucesso desconhecido após trim:', savedType);
        return;
      }
      
      if (!message) {
        console.warn('⚠️ Dashboard: Mensagem vazia após processar tipo:', savedType);
        return;
      }
      
      console.log('💾 Dashboard: Definindo mensagem final:', message);
      setSuccessMessage(message);
      
      // Mostrar toast após delay para garantir que a página está completamente renderizada
      requestAnimationFrame(() => {
        setTimeout(() => {
          console.log('🎉 Dashboard: Exibindo toast agora!', { message, tipo: savedType });
          setShowSuccessToast(true);
        }, 800);
      });
    } else {
      console.log('ℹ️ Dashboard: Nenhum toast pendente na URL ou tipo inválido:', successType);
    }
  }, [t, user, authLoading, searchParams, setSearchParams]);

  return (
    <>
      {/* Nav bar - pesquisa, filtro, data, membros, botão nova transação - Fixa no topo */}
      <DashboardHeader />
      
      <div className="w-full pt-[104px] pb-6 space-y-6">

        {/* PRIMEIRO BLOCO: Dividido em 2 colunas - mesma altura */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* COLUNA ESQUERDA (primeira divisão) - mesma altura do card de cartões */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full">
            {/* 4 cards de categorias (primeira linha) - fill container */}
            <div className="flex-1">
              <ExpensesByCategoryGrid />
            </div>
            
            {/* 3 cards maiores abaixo (segunda linha) - ocupando toda largura da primeira divisão */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BalanceCard />
              <IncomeCard />
              <ExpenseCard />
            </div>
          </div>

          {/* COLUNA DIREITA (segunda divisão) - Card de Cartões/contas - sem espaço acima */}
          <div className="lg:col-span-4">
            <CreditCardsWidget 
              onAddCard={() => setIsAddCardOpen(true)}
            />
          </div>
        </div>

        {/* SEGUNDO BLOCO: Dividido em 2 colunas - mesma altura */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Esquerda: Fluxo financeiro */}
          <div className="lg:col-span-8">
            <FinancialFlowChart />
          </div>

          {/* Direita: Próximas despesas */}
          <div className="lg:col-span-4">
            <UpcomingExpensesWidget onAddTransaction={() => {}} />
          </div>
        </div>

        {/* TERCEIRO BLOCO: Largura total - Extrato detalhado */}
        <div className="w-full">
          <TransactionsTable />
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} />
      <AddCardModal isOpen={isAddCardOpen} onClose={() => setIsAddCardOpen(false)} />

      {/* Toast de sucesso após login/signup */}
      <SuccessToast
        message={successMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        duration={4000}
      />
    </>
  );
}
