import { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { formatCurrencyInput } from '@/utils/currency.utils';
import { ImageCropModal } from '@/components/modals/ImageCropModal';
import { storageService } from '@/services/storageService';
import { FamilyMember } from '@/types';
import { getOriginalRole } from '@/services/familyMemberService';

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_0_4064)">
      <path d="M18.4011 7.37877C18.2202 7.32717 18.0551 7.23116 17.9208 7.09947C17.7864 6.96778 17.6872 6.8046 17.6321 6.62477C17.3258 5.58681 16.8122 4.62178 16.1222 3.78806C15.4323 2.95434 14.5803 2.26928 13.618 1.77433C12.6556 1.27937 11.6028 0.984812 10.5233 0.908477C9.44383 0.832143 8.36008 0.975619 7.33764 1.33022C6.3152 1.68483 5.37533 2.24319 4.57492 2.97151C3.7745 3.69984 3.13017 4.58299 2.68093 5.56752C2.23168 6.55205 1.98685 7.6175 1.96126 8.69938C1.93567 9.78127 2.12985 10.8571 2.53205 11.8618C2.62445 12.0732 2.64434 12.3092 2.58863 12.5332C2.53293 12.7571 2.40475 12.9563 2.22405 13.0998C1.42778 13.6908 0.806095 14.486 0.424801 15.4014C0.0435068 16.3168 -0.0832142 17.3183 0.0580501 18.2998C0.278503 19.6266 0.967374 20.8305 1.99963 21.6929C3.03189 22.5552 4.33912 23.0189 5.68405 22.9998H11.001C11.2663 22.9998 11.5206 22.8944 11.7082 22.7069C11.8957 22.5193 12.001 22.265 12.001 21.9998C12.001 21.7345 11.8957 21.4802 11.7082 21.2927C11.5206 21.1051 11.2663 20.9998 11.001 20.9998H5.68405C4.82033 21.0207 3.97768 20.7316 3.30881 20.1847C2.63994 19.6378 2.18912 18.8694 2.03805 18.0188C1.94225 17.3935 2.01989 16.7539 2.26252 16.1697C2.50515 15.5856 2.90346 15.0792 3.41405 14.7058C3.95037 14.3049 4.33833 13.7373 4.51699 13.092C4.69564 12.4467 4.65486 11.7604 4.40105 11.1408C3.8992 9.81547 3.8734 8.35698 4.32805 7.01477C4.69125 5.96334 5.34163 5.03464 6.20553 4.33387C7.06944 3.6331 8.11232 3.18827 9.21605 3.04977C9.47207 3.01681 9.72992 3.00011 9.98805 2.99977C11.2811 2.9955 12.5408 3.4102 13.5784 4.18176C14.616 4.95332 15.3758 6.04024 15.7441 7.27977C15.8878 7.75214 16.1467 8.18134 16.4976 8.52872C16.8485 8.87611 17.2803 9.13077 17.7541 9.26977C18.9135 9.61269 19.9406 10.3016 20.6978 11.2444C21.4549 12.1871 21.906 13.3387 21.9906 14.5448C22.0752 15.751 21.7893 16.9543 21.1712 17.9935C20.5531 19.0327 19.6323 19.8583 18.5321 20.3598C18.3692 20.4431 18.2331 20.5706 18.1392 20.7276C18.0453 20.8846 17.9974 21.0649 18.0011 21.2478C17.9991 21.4132 18.0388 21.5765 18.1164 21.7227C18.194 21.8689 18.307 21.9932 18.4452 22.0843C18.5834 22.1754 18.7422 22.2303 18.9071 22.244C19.072 22.2577 19.2377 22.2298 19.3891 22.1628C23.5231 20.1758 25.7691 14.9488 22.2691 9.89877C21.3053 8.64168 19.9403 7.75238 18.4011 7.37877Z" fill="currentColor"/>
      <path d="M18.708 16.7069C18.8954 16.5194 19.0007 16.2651 19.0007 15.9999C19.0007 15.7348 18.8954 15.4804 18.708 15.2929L17.122 13.7069C16.5594 13.1445 15.7964 12.8286 15.0009 12.8286C14.2055 12.8286 13.4425 13.1445 12.8799 13.7069L11.2939 15.2929C11.1118 15.4815 11.011 15.7341 11.0133 15.9963C11.0156 16.2585 11.1207 16.5093 11.3061 16.6947C11.4915 16.8801 11.7424 16.9853 12.0045 16.9876C12.2667 16.9899 12.5193 16.8891 12.7079 16.7069L14.0009 15.4139V22.9999C14.0009 23.2651 14.1063 23.5195 14.2938 23.707C14.4814 23.8946 14.7357 23.9999 15.0009 23.9999C15.2662 23.9999 15.5205 23.8946 15.7081 23.707C15.8956 23.5195 16.0009 23.2651 16.0009 22.9999V15.4139L17.2939 16.7069C17.4815 16.8944 17.7358 16.9997 18.0009 16.9997C18.2661 16.9997 18.5204 16.8944 18.708 16.7069Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_0_4064">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4H14M6 4V2C6 1.73478 6.10536 1.48043 6.29289 1.29289C6.48043 1.10536 6.73478 1 7 1H9C9.26522 1 9.51957 1.10536 9.70711 1.29289C9.89464 1.48043 10 1.73478 10 2V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2762C12.026 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2762C3.47381 14.0261 3.33334 13.687 3.33334 13.3333V4H12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember?: FamilyMember | null;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const roleSuggestions = ['Pai', 'Mãe', 'Filho', 'Filha', 'Avô', 'Avó', 'Tio', 'Tia'];

export function AddMemberModal({ isOpen, onClose, editingMember }: AddMemberModalProps) {
  const { addFamilyMember, updateFamilyMember } = useFinance();
  const { user } = useAuth();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { familyMembers } = useFinance();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [_monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyIncomeDisplay, setMonthlyIncomeDisplay] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Buscar owner por padrão
  useEffect(() => {
    if (isOpen && familyMembers.length > 0) {
      const owner = familyMembers.find(m => m.role.toLowerCase() === 'owner');
      if (owner) {
        // Não preencher automaticamente, mas mostrar que owner já existe
      }
    }
  }, [isOpen, familyMembers]);

  useEffect(() => {
    if (isOpen && editingMember) {
      // Modo edição: preencher campos
      setName(editingMember.name);
      // Buscar role original do banco usando getOriginalRole
      const originalRole = getOriginalRole(editingMember.id);
      const roleDisplay = originalRole || (editingMember.role === 'owner' ? 'Owner' : editingMember.role);
      setRole(roleDisplay);
      setAvatarUrl(editingMember.avatarUrl || '');
      setMonthlyIncomeDisplay('');
      setMonthlyIncome('');
    } else if (!isOpen) {
      // Resetar campos
      setName('');
      setRole('');
      setAvatarUrl('');
      setMonthlyIncome('');
      setMonthlyIncomeDisplay('');
      setErrors({});
      setSelectedImageFile(null);
      setIsCropModalOpen(false);
      setIsUploading(false);
    }
  }, [isOpen, editingMember]);

  const handleMonthlyIncomeChange = (value: string) => {
    const { display, numeric } = formatCurrencyInput(value);
    setMonthlyIncomeDisplay(display);
    setMonthlyIncome(numeric.toString());
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: 'A imagem deve ter no máximo 5MB' });
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErrors({ avatar: 'Por favor, selecione uma imagem válida' });
      return;
    }

    setSelectedImageFile(file);
    setIsCropModalOpen(true);
    setErrors({});
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!user?.id) {
      setErrors({ avatar: 'Usuário não autenticado' });
      return;
    }

    setIsUploading(true);
    try {
      const url = await storageService.uploadAvatar(croppedFile, user.id);
      setAvatarUrl(url);
      setIsUploading(false);
      setSelectedImageFile(null);
      setErrors({}); // Limpar erros ao ter sucesso
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setErrors({ avatar: 'Erro ao fazer upload da imagem. Tente novamente.' });
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    setErrors({});
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!name || name.length < 3) {
      newErrors.name = 'Por favor, insira um nome válido';
    }

    if (!role) {
      newErrors.role = 'Por favor, informe quem é na família';
    }

    // Validar que não está tentando criar/editar owner
    const roleLower = role.toLowerCase().trim();
    const ownerVariations = ['owner', 'proprietário', 'proprietaria', 'dono', 'dona'];
    if (ownerVariations.includes(roleLower)) {
      newErrors.role = 'Não é permitido criar ou editar membros com role "Owner". O owner é criado automaticamente ao cadastrar a conta.';
    }

    // Se estiver editando um owner existente, não permitir mudar o role
    if (editingMember) {
      const originalRole = getOriginalRole(editingMember.id);
      if (originalRole && originalRole.toLowerCase() === 'owner') {
        // Não permitir editar owner - apenas o nome e avatar podem ser editados em outro lugar
        if (roleLower !== 'owner' && ownerVariations.includes(roleLower)) {
          newErrors.role = 'Não é permitido alterar o role do owner.';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingMember) {
        // Modo edição - verificar se não é owner
        const originalRole = getOriginalRole(editingMember.id);
        if (originalRole && originalRole.toLowerCase() === 'owner') {
          newErrors.role = 'Não é permitido editar o owner através deste modal.';
          setErrors(newErrors);
          return;
        }
        
        // Modo edição - passar role customizado diretamente
        let roleToSave: 'owner' | 'member' | 'viewer' = 'member';
        
        if (roleLower === 'viewer') {
          roleToSave = 'viewer';
        } else {
          roleToSave = 'member';
        }
        
        // Passar role customizado (Filho, Pai, etc.) como parâmetro adicional
        await updateFamilyMember(editingMember.id, {
          name,
          role: roleToSave,
          avatarUrl: avatarUrl || undefined,
        }, role); // Passar role customizado
      } else {
        // Modo criação - não permitir criar owner
        let roleToSave: 'owner' | 'member' | 'viewer' = 'member';
        
        if (roleLower === 'viewer') {
          roleToSave = 'viewer';
        } else {
          roleToSave = 'member';
        }
        
        // Passar role customizado (Filho, Pai, etc.) como parâmetro adicional
        await addFamilyMember({
          userId: user?.id || '',
          name,
          email: '',
          role: roleToSave,
          avatarUrl: avatarUrl || undefined,
          color: '', // Será gerada automaticamente pelo service se vazia
        }, role); // Passar role customizado
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
      setErrors({ submit: 'Erro ao salvar membro. Tente novamente.' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <h2 className="text-xl font-bold text-gray-900">
          {editingMember ? 'Editar Membro da Família' : t('modals.addMember.title')}
        </h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.addMember.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('modals.addMember.namePlaceholder')}
            className={`
              w-full h-12 px-4 rounded-[40px] border
              ${errors.name ? 'border-red-500' : 'border-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quem é na família <span className="text-gray-400 text-xs">(ex.: Pai, mãe, esposa, filho...)</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex.: Pai, mãe, esposa, filho..."
            list="role-suggestions"
            className={`
              w-full h-12 px-4 rounded-[40px] border
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
            {t('modals.addMember.monthlyIncome')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyIncomeDisplay}
              onChange={(e) => handleMonthlyIncomeChange(e.target.value)}
              placeholder="0,00"
              className="w-full h-12 pr-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ paddingLeft: '56px' }}
            />
          </div>
        </div>

        {/* Avatar Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.addMember.avatar')}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {avatarUrl ? (
            <div className="flex items-center gap-3">
              {/* Foto */}
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 relative">
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover object-center"
                  style={{ 
                    minWidth: '100%',
                    minHeight: '100%',
                  }}
                />
              </div>
              {/* Botão Alterar Avatar */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 rounded-[40px] border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UploadIcon />
                <span>{isUploading ? 'Enviando...' : 'Alterar Avatar'}</span>
              </button>
              {/* Botão Deletar Avatar */}
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="px-4 py-2 rounded-[40px] border border-red-300 hover:bg-red-50 transition-colors font-medium text-red-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DeleteIcon />
                <span>Deletar Avatar</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full h-12 px-4 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadIcon />
              <span>{isUploading ? 'Enviando...' : 'Enviar Avatar'}</span>
            </button>
          )}
          {errors.avatar && <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 rounded-b-[16px]">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          {t('modals.addMember.save')}
        </button>
      </div>

      {/* Modal de Crop de Imagem */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setSelectedImageFile(null);
        }}
        onCrop={handleCropComplete}
        imageFile={selectedImageFile}
      />
    </Modal>
  );
}
