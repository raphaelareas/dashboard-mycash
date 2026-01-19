import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateShort } from '@/utils/formatDateShort';
import { CreditCard } from '@/types';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { NewTransactionModal } from '@/components/modals/NewTransactionModal';

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function CardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { creditCards, deleteCreditCard, transactions } = useFinance();
  const { t } = useI18n();
  const [card, setCard] = useState<CreditCard | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const foundCard = creditCards.find(c => c.id === id);
      if (foundCard) {
        setCard(foundCard);
      } else {
        // Se não encontrou o cartão, redirecionar para a lista
        navigate('/cartoes');
      }
    }
  }, [id, creditCards, navigate]);

  if (!card) {
    return (
      <div className="w-full py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteCreditCard(card.id);
      navigate('/cartoes');
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
      alert('Erro ao deletar cartão. Tente novamente.');
    }
  };

  const limit = card.limit || 0;
  const usagePercentage = limit > 0 ? (card.currentBalance / limit) * 100 : 0;
  const availableLimit = limit - card.currentBalance;

  // Obter nomes de categorias via tradução
  const categoryNames: Record<string, string> = {
    rent: t('categories.categoryNames.rent'),
    food: t('categories.categoryNames.food'),
    shopping: t('categories.categoryNames.shopping'),
    household: t('categories.categoryNames.household'),
    transport: t('categories.categoryNames.transport'),
    entertainment: t('categories.categoryNames.entertainment'),
    health: t('categories.categoryNames.health'),
    education: t('categories.categoryNames.education'),
    other: t('categories.categoryNames.other'),
  };

  // Filtrar despesas do cartão
  const cardExpenses = transactions
    .filter((t) => t.type === 'expense' && t.accountId === card.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (usagePercentage / 100) * circumference;

  return (
    <>
      <div className="w-full py-6 space-y-6">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cartoes')}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{card.name}</h1>
        </div>

        {/* Informações do Titular */}
        {card.holderName && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Titular</p>
            <p className="text-base font-semibold text-gray-900">{card.holderName}</p>
          </div>
        )}

        {/* Informações do Cartão */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('cards.totalLimit')}</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(limit)}</p>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('cards.currentBill')}</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(card.currentBalance)}</p>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('cards.availableLimit')}</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(availableLimit)}</p>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Uso do Limite</p>
            <p className="text-lg font-bold text-gray-900">{usagePercentage.toFixed(1)}%</p>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('cards.dueDay')}</p>
            <p className="text-lg font-bold text-gray-900">Dia {card.dueDay}</p>
          </div>

          {card.lastFourDigits && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Últimos 4 Dígitos</p>
              <p className="text-lg font-bold text-gray-900 font-mono">•••• {card.lastFourDigits}</p>
            </div>
          )}
        </div>

        {/* Gráfico Donut */}
        <div className="flex justify-center py-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#A3E635"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {usagePercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Tabela de Despesas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Transações Recentes</h3>
            <button
              onClick={() => setIsNewTransactionOpen(true)}
              className="px-4 py-2 rounded-[40px] border border-gray-200 hover:bg-gray-50 text-sm"
            >
              {t('cards.addExpense')}
            </button>
          </div>

          {cardExpenses.length === 0 ? (
            <div className="py-8 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
              Nenhuma transação encontrada
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-50 grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-600">
                <div className="col-span-2">Data</div>
                <div className="col-span-4">Descrição</div>
                <div className="col-span-3">Categoria</div>
                <div className="col-span-1">Parcelas</div>
                <div className="col-span-2 text-right">Valor</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cardExpenses.slice(0, 10).map((expense) => (
                  <div key={expense.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50">
                    <div className="col-span-2 text-sm text-gray-600">
                      {formatDateShort(new Date(expense.date))}
                    </div>
                    <div className="col-span-4 font-semibold text-gray-900">{expense.description}</div>
                    <div className="col-span-3">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                        {categoryNames[expense.category] || expense.category || 'Sem categoria'}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      {expense.installments && expense.installments > 1 ? `${expense.installments}x` : '-'}
                    </div>
                    <div className="col-span-2 text-right font-bold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão Deletar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-6 py-3 rounded-[40px] border border-red-300 text-red-600 hover:bg-red-50 transition-colors font-semibold"
          >
            {t('common.delete') || 'Deletar Cartão'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Deletar Cartão"
        message="Tem certeza que deseja deletar este cartão? Todas as transações associadas a este cartão serão mantidas, mas o cartão será removido permanentemente."
        itemName={card.name}
      />
      <NewTransactionModal
        isOpen={isNewTransactionOpen}
        onClose={() => setIsNewTransactionOpen(false)}
      />
    </>
  );
}
