import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { Category, TransactionType } from '@/types';
import { CreateCategoryModal } from '@/components/modals/CreateCategoryModal';

const CategoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4H17M3 8H17M3 12H13M3 16H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.3333 2.00002C11.5084 1.82487 11.7163 1.68601 11.9451 1.59129C12.1739 1.49657 12.4189 1.44775 12.6667 1.44775C12.9144 1.44775 13.1594 1.49657 13.3882 1.59129C13.617 1.68601 13.8249 1.82487 14 2.00002C14.1751 2.17517 14.314 2.38313 14.4087 2.61193C14.5034 2.84073 14.5522 3.08569 14.5522 3.33335C14.5522 3.58101 14.5034 3.82597 14.4087 4.05477C14.314 4.28357 14.1751 4.49153 14 4.66669L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00002Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4H14M6 4V2C6 1.73478 6.10536 1.48043 6.29289 1.29289C6.48043 1.10536 6.73478 1 7 1H9C9.26522 1 9.51957 1.10536 9.70711 1.29289C9.89464 1.48043 10 1.73478 10 2V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2762C12.026 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2762C3.47381 14.0261 3.33334 13.687 3.33334 13.3333V4H12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory, refreshCategories, transactions } = useFinance();
  const { t } = useI18n();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Obter nomes de categorias padrão via tradução
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

  useEffect(() => {
    refreshCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (filterType === 'all') return true;
    return cat.type === filterType;
  });

  const handleCreate = async (name: string, type: TransactionType, color?: string, accountId?: string | null) => {
    try {
      await addCategory({
        name,
        type,
        color: color || '#111827',
        accountId: accountId || null,
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleEdit = async (category: Category, name: string, type: TransactionType, color?: string, accountId?: string | null) => {
    try {
      await updateCategory(category.id, {
        name,
        type,
        color: color || category.color,
        accountId: accountId !== undefined ? accountId : category.accountId,
      });
      setEditingCategory(null);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('categories.confirmDelete'))) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Erro ao deletar categoria:', error);
      }
    }
  };

  return (
    <>
      <div className="w-full py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('categories.title')}</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2"
          >
            <span>+</span>
            <span>{t('categories.newCategory')}</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-[40px] w-fit">
            <button
              onClick={() => setFilterType('all')}
              className={`
                px-4 py-2 rounded-[40px] font-semibold transition-all text-sm
                ${filterType === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
              `}
            >
              {t('categories.all')}
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`
                px-4 py-2 rounded-[40px] font-semibold transition-all text-sm
                ${filterType === 'expense' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
              `}
            >
              {t('categories.expenses')}
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`
                px-4 py-2 rounded-[40px] font-semibold transition-all text-sm
                ${filterType === 'income' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
              `}
            >
              {t('categories.income')}
            </button>
          </div>
        </div>

        {/* Lista de Categorias */}
        {filteredCategories.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-lg border border-gray-200">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CategoryIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-4">{t('categories.noCategories')}</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800"
            >
              {t('categories.createFirstCategory')}
            </button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Header da Lista */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b border-gray-200">
              <div className="col-span-1">{t('categories.color')}</div>
              <div className="col-span-3">{t('categories.name')}</div>
              <div className="col-span-2">{t('categories.type')}</div>
              <div className="col-span-2">{t('categories.quantity')}</div>
              <div className="col-span-4 flex justify-end gap-2">{t('categories.actions')}</div>
            </div>

            {/* Lista de Categorias */}
            <div className="divide-y divide-gray-100">
              {filteredCategories.map((category, index) => {
                const isEven = index % 2 === 0;
                const isDefaultCategory = category.id.startsWith('default_');
                
                const categoryTransactions = transactions.filter(t => {
                  // Se for categoria padrão, verificar pelo enum
                  if (isDefaultCategory) {
                    const categoryEnum = category.id.replace('default_', '') as TransactionCategory;
                    // Verificar se a transação usa o mesmo enum ou o nome traduzido
                    return t.category === categoryEnum || 
                           t.category === category.name ||
                           (typeof t.category === 'string' && categoryNames[categoryEnum] === t.category);
                  }
                  
                  // Para categorias customizadas, verificar pelo nome
                  if (typeof t.category === 'string') {
                    return t.category === category.name;
                  }
                  
                  return false;
                });
                const transactionCount = categoryTransactions.length;

                return (
                  <div
                    key={category.id}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 items-center ${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                  >
                    {/* Cor */}
                    <div className="col-span-1 flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                        title={category.color}
                      >
                        {category.icon || '📌'}
                      </div>
                    </div>

                    {/* Nome */}
                    <div className="col-span-3">
                      <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                    </div>

                    {/* Tipo (Despesa ou Entrada) */}
                    <div className="col-span-2">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${category.type === 'income' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                        }
                      `}>
                        {category.type === 'income' ? t('categories.income') : t('categories.expenses')}
                      </span>
                    </div>

                    {/* Quantidade */}
                    <div className="col-span-2">
                      <span className="text-sm font-medium text-gray-900">{transactionCount}</span>
                    </div>

                    {/* Ações (Editar e Deletar) */}
                    <div className="col-span-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="px-3 py-2 rounded-[40px] border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm text-gray-700 transition-colors"
                      >
                        <EditIcon />
                        <span>{t('categories.edit')}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="px-3 py-2 rounded-[40px] border border-red-200 hover:bg-red-50 flex items-center justify-center gap-2 text-sm text-red-600 transition-colors"
                      >
                        <DeleteIcon />
                        <span>{t('categories.delete')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Criar Categoria */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {/* Modal de Editar Categoria - reutiliza CreateCategoryModal */}
      {editingCategory && (
        <CreateCategoryModal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={(name, type, color, accountId) => handleEdit(editingCategory, name, type, color, accountId)}
          initialName={editingCategory.name}
          initialType={editingCategory.type}
          initialColor={editingCategory.color}
          initialAccountId={editingCategory.accountId || null}
        />
      )}
    </>
  );
}