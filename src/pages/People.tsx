import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { FamilyMember } from '@/types';
import { getOriginalRole } from '@/services/familyMemberService';

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

const DragHandleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2H10M6 6H10M6 10H10M6 14H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function People() {
  const { familyMembers, deleteFamilyMember } = useFinance();
  const { t } = useI18n();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'confirm';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    message: '',
  });

  const handleDelete = async (member: FamilyMember) => {
    // Não permitir deletar o owner
    if (member.role.toLowerCase() === 'owner') {
      setAlertDialog({
        isOpen: true,
        message: t('people.cannotDeleteOwner'),
        type: 'error',
      });
      return;
    }

    const message = t('people.confirmDeleteMember').replace('{{name}}', member.name);
    setAlertDialog({
      isOpen: true,
      message,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteFamilyMember(member.id);
        } catch (error) {
          console.error('Erro ao deletar membro:', error);
          setAlertDialog({
            isOpen: true,
            message: t('people.deleteMemberError'),
            type: 'error',
          });
        }
      },
    });
  };

  const handleEdit = (member: FamilyMember) => {
    // Não permitir editar owner através do modal
    if (member.role.toLowerCase() === 'owner') {
      setAlertDialog({
        isOpen: true,
        message: t('people.cannotEditOwner'),
        type: 'info',
      });
      return;
    }
    setEditingMember(member);
    setIsAddMemberOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    // Reordenar membros (por enquanto apenas no frontend)
    // TODO: Implementar persistência no backend se necessário
    const newMembers = [...familyMembers];
    const [removed] = newMembers.splice(draggedIndex, 1);
    newMembers.splice(dropIndex, 0, removed);
    
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <>
      <div className="w-full py-6">
        {/* Header com botão fixo no topo direito */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('people.title')}</h1>
          <button
            onClick={() => {
              setEditingMember(null);
              setIsAddMemberOpen(true);
            }}
            className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold flex items-center gap-2"
          >
            <span>+</span>
            <span>{t('people.addMember')}</span>
          </button>
        </div>

        {/* Lista de Membros da Família - Sem empty state, sempre tem owner */}
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('people.familyMembers')}</h3>

          <div className="space-y-0">
            {/* Ordenar: owner primeiro, depois os demais */}
            {[...familyMembers].sort((a, b) => {
              const aIsOwner = a.role.toLowerCase() === 'owner';
              const bIsOwner = b.role.toLowerCase() === 'owner';
              if (aIsOwner && !bIsOwner) return -1;
              if (!aIsOwner && bIsOwner) return 1;
              return 0;
            }).map((member, index) => {
              const isEven = index % 2 === 0;
              // Obter role original do banco (Filho, Pai, etc.) ou usar o mapeado
              const originalRole = getOriginalRole(member.id);
              const roleDisplay = originalRole || (member.role.toLowerCase() === 'owner' ? 'Owner' : member.role);
              
              return (
                <div
                  key={member.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center gap-4 p-4 transition-colors cursor-move
                    ${isEven ? 'bg-white' : 'bg-gray-50'}
                    hover:bg-gray-100
                    ${draggedIndex === index ? 'opacity-50' : ''}
                  `}
                >
                  {/* Botão de reordenar (drag handle) no canto esquerdo */}
                  <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <DragHandleIcon />
                  </div>

                  {/* Avatar */}
                  {member.avatarUrl ? (
                    <img 
                      src={member.avatarUrl} 
                      alt={member.name} 
                      className="w-12 h-12 rounded-full flex-shrink-0 object-cover" 
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium"
                      style={{ backgroundColor: member.color, color: '#111827' }}
                    >
                      {member.name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('')}
                    </div>
                  )}

                  {/* Informações do membro */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                      {member.role.toLowerCase() === 'owner' && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {t('people.you')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {member.role.toLowerCase() === 'owner' ? t('people.owner') : roleDisplay}
                    </p>
                  </div>

                  {/* Botões de ação no canto direito */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
                      title="Editar membro"
                    >
                      <EditIcon />
                    </button>
                    {member.role.toLowerCase() !== 'owner' && (
                      <button
                        onClick={() => handleDelete(member)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                        title="Deletar membro"
                      >
                        <DeleteIcon />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AddMemberModal 
        isOpen={isAddMemberOpen} 
        onClose={() => {
          setIsAddMemberOpen(false);
          setEditingMember(null);
        }}
        editingMember={editingMember}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        message={alertDialog.message}
        type={alertDialog.type}
        onConfirm={alertDialog.onConfirm}
      />
    </>
  );
}
