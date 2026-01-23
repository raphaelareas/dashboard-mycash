import { useState, useEffect, useRef } from 'react';
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
  const toastShownRef = useRef(false);
  
  // Verificar se deve mostrar toast de sucesso após login/signup
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

    const shouldShowToast = sessionStorage.getItem('showSuccessToast');
    const toastType = sessionStorage.getItem('successToastType');
    
    console.log('🔍 Dashboard: Verificando toast:', { 
      shouldShowToast, 
      toastType, 
      user: user?.email,
      rawType: typeof toastType,
      typeValue: toastType
    });
    
    if (shouldShowToast === 'true' && toastType) {
      // Marcar como mostrado imediatamente para evitar duplicação
      toastShownRef.current = true;
      
      // Salvar o tipo antes de limpar (para debug)
      const savedType = toastType;
      
      // Limpar flags imediatamente
      sessionStorage.removeItem('showSuccessToast');
      sessionStorage.removeItem('successToastType');
      
      // Definir mensagem baseada no tipo - validar explicitamente
      let message = '';
      if (savedType === 'signup' || savedType === 'SignUp' || savedType === 'SIGNUP') {
        message = t('auth.signupSuccess');
        console.log('✅ Dashboard: Preparando toast de SIGNUP:', message, '| Tipo recebido:', savedType);
      } else if (savedType === 'login' || savedType === 'Login' || savedType === 'LOGIN') {
        message = t('auth.loginSuccess');
        console.log('✅ Dashboard: Preparando toast de LOGIN:', message, '| Tipo recebido:', savedType);
      } else {
        console.warn('⚠️ Dashboard: Tipo de toast inválido ou desconhecido:', savedType, '| Tipo original:', toastType);
        // Fallback: se não conseguir identificar, não mostrar toast
        return;
      }
      
      if (!message) {
        console.warn('⚠️ Dashboard: Mensagem vazia após processar tipo:', savedType);
        return;
      }
      
      setSuccessMessage(message);
      
      // Mostrar toast após delay maior para garantir que a página está completamente renderizada
      // Usar requestAnimationFrame para garantir que o DOM está pronto
      requestAnimationFrame(() => {
        setTimeout(() => {
          console.log('🎉 Dashboard: Exibindo toast agora!');
          setShowSuccessToast(true);
        }, 1000); // Aumentado para 1 segundo para garantir visibilidade
      });
    } else {
      console.log('ℹ️ Dashboard: Nenhum toast pendente');
    }
  }, [t, user, authLoading]);

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
        duration={5000}
      />
    </>
  );
}
