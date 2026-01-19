import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { AddMemberModal } from '@/components/modals/AddMemberModal';

export default function People() {
  const { familyMembers } = useFinance();
  const { t } = useI18n();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const currentUser = familyMembers[0] || null;

  return (
    <>
      <div className="w-full py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('people.title')}</h1>

        <div className="space-y-6">
          {/* Perfil do Usuário */}
          {currentUser && (
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-30 h-30 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0" style={{ width: '120px', height: '120px' }}>
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-300" />
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentUser.name}</h2>
                  <p className="text-gray-600 mb-2">{currentUser.role}</p>
                  <p className="text-gray-600 mb-2 flex items-center justify-center md:justify-start gap-2">
                    <span>✉</span>
                    <span>{currentUser.email}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Membros da Família */}
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('people.familyMembers')}</h3>
            </div>

            {familyMembers.length <= 1 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">{t('people.addFamilyMemberDescription') || 'Adicione membros da sua família para compartilhar as finanças'}</p>
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800"
                >
                  {t('people.addMember')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt="" className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(0)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} />
    </>
  );
}