import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { CreditCard } from '@/types';
import { CardDetailsModal } from '@/components/modals/CardDetailsModal';
import { NewTransactionModal } from '@/components/modals/NewTransactionModal';
import { AddCardModal } from '@/components/modals/AddCardModal';

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default function Cards() {
  const { creditCards } = useFinance();
  const { t } = useI18n();
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const sortedCards = [...creditCards.filter(c => c.isActive)].sort((a, b) => 
    b.currentBalance - a.currentBalance
  );

  const handleCardClick = (card: CreditCard) => {
    setSelectedCard(card);
    setIsDetailsOpen(true);
  };

  const handleAddTransaction = () => {
    setIsDetailsOpen(false);
    setIsNewTransactionOpen(true);
  };

  const calculateUsagePercentage = (current: number, limit?: number): number => {
    if (!limit || limit === 0) return 0;
    return (current / limit) * 100;
  };

  return (
    <>
      <div className="w-full py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t('cards.title')}</h1>
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2"
          >
            <span>+</span>
            <span>{t('cards.newCard')}</span>
          </button>
        </div>

        {/* Cards Grid */}
        {sortedCards.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-4">{t('cards.noCards')}</h2>
            <button
              onClick={() => setIsAddCardOpen(true)}
              className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800"
            >
              {t('cards.registerFirstCard')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCards.map((card) => {
              const usage = calculateUsagePercentage(card.currentBalance, card.limit);
              const available = (card.limit || 0) - card.currentBalance;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="
                    p-6 bg-white border border-gray-200 rounded-lg
                    hover:shadow-lg hover:-translate-y-1
                    transition-all duration-200 cursor-pointer
                  "
                >
                  {/* Nome do Cartão */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{card.name}</h3>

                  {/* Valores */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('cards.totalLimit')}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(card.limit || 0)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('cards.currentBill')}</p>
                      <p className={`text-2xl font-bold ${usage > 80 ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(card.currentBalance)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('cards.availableLimit')}</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(available)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('cards.limitUsage')}</p>
                      <p className="text-lg font-bold text-gray-900">{usage.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${usage > 80 ? 'bg-red-500' : 'bg-lime-500'}`}
                      style={{ width: `${Math.min(usage, 100)}%` }}
                    />
                  </div>

                  {/* Datas */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>{t('cards.dueDay')}: {t('common.day') || 'Dia'} {card.dueDay}</span>
                    {card.lastFourDigits && (
                      <span className="font-mono">•••• {card.lastFourDigits}</span>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(card);
                      }}
                      className="flex-1 px-3 py-2 text-sm rounded-[40px] border border-gray-200 hover:bg-gray-50"
                    >
                      {t('cards.viewDetails')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDetailsOpen(false);
                        setIsNewTransactionOpen(true);
                      }}
                      className="flex-1 px-3 py-2 text-sm rounded-[40px] border border-gray-200 hover:bg-gray-50"
                    >
                      {t('cards.addExpense')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CardDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        card={selectedCard}
        onAddTransaction={handleAddTransaction}
        onEditCard={() => {
          // TODO: Implementar edição
          setIsDetailsOpen(false);
        }}
      />
      <NewTransactionModal
        isOpen={isNewTransactionOpen}
        onClose={() => setIsNewTransactionOpen(false)}
      />
      <AddCardModal isOpen={isAddCardOpen} onClose={() => setIsAddCardOpen(false)} />
    </>
  );
}

