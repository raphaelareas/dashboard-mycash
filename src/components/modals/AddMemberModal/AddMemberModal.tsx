import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Modal } from '@/components/ui/Modal';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const roleSuggestions = ['Pai', 'Mãe', 'Filho', 'Filha', 'Avô', 'Avó', 'Tio', 'Tia'];

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { addFamilyMember } = useFinance();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setRole('');
      setAvatarUrl('');
      setMonthlyIncome('');
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!name || name.length < 3) {
      newErrors.name = 'Por favor, insira um nome válido';
    }

    if (!role) {
      newErrors.role = 'Por favor, informe a função na família';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addFamilyMember({
      userId: `user-${Date.now()}`,
      name,
      email: '',
      role: role as 'owner' | 'member' | 'viewer',
      avatarUrl: avatarUrl || undefined,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <h2 className="text-xl font-bold text-gray-900">Adicionar Membro da Família</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
            className={`
              w-full h-12 px-4 rounded-lg border
              ${errors.name ? 'border-red-500' : 'border-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Função na Família
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex: Pai, Mãe, Filho..."
            list="role-suggestions"
            className={`
              w-full h-12 px-4 rounded-lg border
              ${errors.role ? 'border-red-500' : 'border-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
          />
          <datalist id="role-suggestions">
            {roleSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL do Avatar (opcional)
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Renda Mensal Estimada (opcional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">R$</span>
            <input
              type="number"
              step="0.01"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="0,00"
              className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 rounded-b-[16px]">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          Adicionar Membro
        </button>
      </div>
    </Modal>
  );
}
