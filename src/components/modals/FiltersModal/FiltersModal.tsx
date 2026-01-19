import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { Modal } from '@/components/ui/Modal';
import { defaultCategoryColors } from '@/utils/categoryColors';
import { TransactionCategory } from '@/types';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const defaultCategories: TransactionCategory[] = ['rent', 'food', 'shopping', 'household', 'transport', 'entertainment', 'health', 'education', 'other'];

export function FiltersModal({ isOpen, onClose }: FiltersModalProps) {
  const { 
    transactionType,
    selectedMember,
    selectedCategories,
    selectedAccounts,
    selectedCards,
    familyMembers,
    categories: customCategories,
    bankAccounts,
    creditCards,
    setTransactionType,
    setSelectedMember,
    setSelectedCategories,
    setSelectedAccounts,
    setSelectedCards,
  } = useFinance();
  const { t } = useI18n();

  // Estados temporários (não aplicados até clicar em "Aplicar")
  const [tempType, setTempType] = useState<'all' | 'income' | 'expense'>(transactionType);
  const [tempMember, setTempMember] = useState<string | null>(selectedMember);
  const [tempCategories, setTempCategories] = useState<string[]>(selectedCategories);
  const [tempAccounts, setTempAccounts] = useState<string[]>(selectedAccounts);
  const [tempCards, setTempCards] = useState<string[]>(selectedCards);

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

  // Resetar estados temporários quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setTempType(transactionType);
      setTempMember(selectedMember);
      setTempCategories(selectedCategories);
      setTempAccounts(selectedAccounts);
      setTempCards(selectedCards);
    }
  }, [isOpen, transactionType, selectedMember, selectedCategories, selectedAccounts, selectedCards]);

  const handleApply = () => {
    setTransactionType(tempType);
    setSelectedMember(tempMember);
    setSelectedCategories(tempCategories);
    setSelectedAccounts(tempAccounts);
    setSelectedCards(tempCards);
    onClose();
  };

  const handleClear = () => {
    // Limpar filtros temporários
    setTempType('all');
    setTempMember(null);
    setTempCategories([]);
    setTempAccounts([]);
    setTempCards([]);
    
    // Aplicar filtros limpos imediatamente
    setTransactionType('all');
    setSelectedMember(null);
    setSelectedCategories([]);
    setSelectedAccounts([]);
    setSelectedCards([]);
    
    // Fechar o modal
    onClose();
  };

  const toggleCategory = (category: string) => {
    if (tempCategories.includes(category)) {
      setTempCategories(tempCategories.filter(c => c !== category));
    } else {
      setTempCategories([...tempCategories, category]);
    }
  };

  const toggleAccount = (accountId: string) => {
    if (tempAccounts.includes(accountId)) {
      setTempAccounts(tempAccounts.filter(id => id !== accountId));
    } else {
      setTempAccounts([...tempAccounts, accountId]);
    }
  };

  const toggleCard = (cardId: string) => {
    if (tempCards.includes(cardId)) {
      setTempCards(tempCards.filter(id => id !== cardId));
    } else {
      setTempCards([...tempCards, cardId]);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[16px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
          <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.filters') || 'Filtros'}</h2>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tipo de Transação (Entradas e Saídas) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('dashboard.transactionType') || 'Tipo de Transação'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTempType(type)}
                  className={`
                    h-12 rounded-[40px] font-semibold transition-all
                    ${tempType === type
                      ? 'text-gray-900'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }
                    ${tempType === type ? 'style={{ backgroundColor: "#f9f9f9" }}' : ''}
                  `}
                >
                  {type === 'all' ? t('transactions.all') : type === 'income' ? t('transactions.income') : t('transactions.expense')}
                </button>
              ))}
            </div>
          </div>

          {/* Pessoas */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('people.title') || 'Pessoas'}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTempMember(null)}
                className={`
                  h-12 px-4 rounded-[40px] font-semibold transition-all
                  ${!tempMember
                    ? 'text-gray-900'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
                style={!tempMember ? { backgroundColor: '#f9f9f9' } : undefined}
              >
                {t('transactions.allMembers') || 'Todos'}
              </button>
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setTempMember(tempMember === member.id ? null : member.id)}
                  className={`
                    h-12 px-4 rounded-[40px] font-semibold transition-all flex items-center gap-2
                    ${tempMember === member.id
                      ? 'text-gray-900'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }
                  `}
                  style={tempMember === member.id ? { backgroundColor: '#f9f9f9' } : undefined}
                >
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('categories.title') || 'Categorias'}
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Categorias padrão */}
              {defaultCategories.map((cat) => {
                const categoryName = categoryNames[cat] || cat;
                const isSelected = tempCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`
                      h-12 px-4 rounded-[40px] font-semibold transition-all flex items-center gap-2
                      ${isSelected
                        ? 'text-gray-900'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                    style={isSelected ? { backgroundColor: '#f9f9f9' } : undefined}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex-shrink-0 border border-gray-200"
                      style={{ backgroundColor: defaultCategoryColors[cat] || '#6B7280' }}
                    />
                    <span>{categoryName}</span>
                  </button>
                );
              })}
              {/* Categorias customizadas */}
              {customCategories.map((cat) => {
                const isSelected = tempCategories.includes(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.name)}
                    className={`
                      h-12 px-4 rounded-[40px] font-semibold transition-all flex items-center gap-2
                      ${isSelected
                        ? 'text-gray-900'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                    style={isSelected ? { backgroundColor: '#f9f9f9' } : undefined}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex-shrink-0 border border-gray-200"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contas Bancárias */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('accounts.title') || 'Contas Bancárias'}
            </label>
            {bankAccounts.filter(a => a.isActive).length === 0 ? (
              <p className="text-sm text-gray-500">{t('accounts.noAccounts') || 'Nenhuma conta cadastrada'}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {bankAccounts.filter(a => a.isActive).map((account) => {
                  const isSelected = tempAccounts.includes(account.id);
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => toggleAccount(account.id)}
                      className={`
                        h-12 px-4 rounded-[40px] font-semibold transition-all flex items-center gap-2
                        ${isSelected
                          ? 'text-gray-900'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }
                      `}
                      style={isSelected ? { backgroundColor: '#f9f9f9' } : undefined}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex-shrink-0 border border-gray-200"
                        style={{ backgroundColor: account.color || '#3247FF' }}
                      />
                      <span>{account.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cartões de Crédito */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('cards.title') || 'Cartões de Crédito'}
            </label>
            {creditCards.filter(c => c.isActive).length === 0 ? (
              <p className="text-sm text-gray-500">{t('cards.noCards') || 'Nenhum cartão cadastrado'}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {creditCards.filter(c => c.isActive).map((card) => {
                  const isSelected = tempCards.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => toggleCard(card.id)}
                      className={`
                        h-12 px-4 rounded-[40px] font-semibold transition-all flex items-center gap-2
                        ${isSelected
                          ? 'text-gray-900'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }
                      `}
                      style={isSelected ? { backgroundColor: '#f9f9f9' } : undefined}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex-shrink-0 border border-gray-200"
                        style={{ backgroundColor: card.color || '#3247FF' }}
                      />
                      <span>{card.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 rounded-b-[16px] bg-white">
          <button
            type="button"
            onClick={handleClear}
            className="px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors font-semibold text-gray-700"
          >
            {t('common.clear') || 'Limpar'}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-8 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
          >
            {t('dashboard.applyFilters') || 'Aplicar Filtros'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
