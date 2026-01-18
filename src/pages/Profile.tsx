import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { AddMemberModal } from '@/components/modals/AddMemberModal';

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17H3C2.44772 17 2 16.5523 2 16V4C2 3.44772 2.44772 3 3 3H7M13 14L17 10M17 10L13 6M17 10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Profile() {
  const { familyMembers } = useFinance();
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const currentUser = familyMembers[0] || null;

  return (
    <>
      <div className="w-full py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`
              px-6 py-3 font-semibold transition-colors relative
              ${activeTab === 'info' 
                ? 'text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Informações
            {activeTab === 'info' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`
              px-6 py-3 font-semibold transition-colors relative
              ${activeTab === 'settings' 
                ? 'text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Configurações
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
        </div>

        {/* Aba Informações */}
        {activeTab === 'info' && (
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
                <h3 className="text-xl font-bold text-gray-900">Membros da Família</h3>
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Adicionar Membro
                </button>
              </div>

              {familyMembers.length <= 1 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500 mb-4">Adicione membros da sua família para compartilhar as finanças</p>
                  <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Adicionar Membro da Família
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

            {/* Botão Sair */}
            <button className="w-full md:w-auto px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2">
              <LogoutIcon />
              <span>Sair</span>
            </button>
          </div>
        )}

        {/* Aba Configurações */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Preferências de Exibição */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Preferências de Exibição</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-gray-900">Modo Escuro</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Em breve</span>
                    <div className="w-10 h-6 bg-gray-200 rounded-full opacity-50 cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moeda Padrão</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg" disabled>
                    <option>Real Brasileiro (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Data</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg" disabled>
                    <option>DD/MM/AAAA</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notificações */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Notificações</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Lembrete de vencimento de contas', default: true },
                  { label: 'Alerta de aproximação do limite de cartão', default: true },
                  { label: 'Resumo mensal por email', default: false },
                  { label: 'Notificações de novos objetivos alcançados', default: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <label className="font-medium text-gray-900">{item.label}</label>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${item.default ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${item.default ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorias */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Gerenciar Categorias</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Categorias de Receita</h4>
                  <div className="space-y-2 mb-3">
                    {['Salário', 'Freelance', 'Dividendos', 'Outros'].map((cat) => (
                      <div key={cat} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 group">
                        <span className="text-gray-900">{cat}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center">✏️</button>
                          <button className="w-8 h-8 rounded hover:bg-red-100 flex items-center justify-center text-red-600">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">
                    Adicionar Categoria
                  </button>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Categorias de Despesa</h4>
                  <div className="space-y-2 mb-3">
                    {['Aluguel', 'Alimentação', 'Compras', 'Contas de casa', 'Transporte'].map((cat) => (
                      <div key={cat} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 group">
                        <span className="text-gray-900">{cat}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center">✏️</button>
                          <button className="w-8 h-8 rounded hover:bg-red-100 flex items-center justify-center text-red-600">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">
                    Adicionar Categoria
                  </button>
                </div>
              </div>
            </div>

            {/* Dados e Privacidade */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dados e Privacidade</h3>
              
              <div className="space-y-4">
                <button className="w-full px-4 py-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50">
                  Exportar Todos os Dados
                </button>
                <button className="w-full px-4 py-3 text-left rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                  Limpar Todos os Dados
                </button>
                <p className="text-xs text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            {/* Sobre */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sobre o mycash+</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>Versão: v1.0.0</p>
                <p>Sistema de gestão financeira familiar</p>
                <div className="flex gap-4 mt-4">
                  <a href="#" className="text-primary hover:underline">Termos de Uso</a>
                  <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} />
    </>
  );
}
