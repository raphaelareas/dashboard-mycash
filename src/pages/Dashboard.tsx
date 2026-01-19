import { useState, useEffect } from 'react';
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
import { CardDetailsModal } from '@/components/modals/CardDetailsModal';
import { CreditCard } from '@/types';

export default function Dashboard() {
  const [isDelayed, setIsDelayed] = useState(false);
  
  // Se veio da tela de sucesso, adicionar delay de 2 segundos antes de mostrar o dashboard
  useEffect(() => {
    const cameFromSuccess = sessionStorage.getItem('fromSuccess');
    if (cameFromSuccess === 'true') {
      sessionStorage.removeItem('fromSuccess');
      const delayTimer = setTimeout(() => {
        setIsDelayed(true);
      }, 2000);
      return () => clearTimeout(delayTimer);
    } else {
      setIsDelayed(true);
    }
  }, []);
  
  if (!isDelayed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        </div>
      </div>
    );
  }
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false);

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
              onCardClick={(card) => {
                setSelectedCard(card);
                setIsCardDetailsOpen(true);
              }}
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
      <CardDetailsModal
        isOpen={isCardDetailsOpen}
        onClose={() => setIsCardDetailsOpen(false)}
        card={selectedCard}
        onAddTransaction={() => setIsCardDetailsOpen(false)}
        onEditCard={() => setIsCardDetailsOpen(false)}
      />
    </>
  );
}
