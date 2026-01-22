import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { ImageCropModal } from '@/components/modals/ImageCropModal';
import { storageService } from '@/services/storageService';
import { userService, UserProfile } from '@/services/userService';

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

export default function MyAccount() {
  const { user } = useAuth();
  const { familyMembers } = useFinance();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [_profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Buscar owner para usar sua foto
  const owner = familyMembers.find(m => m.role.toLowerCase() === 'owner');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Upload states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar perfil do usuário
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const userProfile = await userService.getProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
          setName(userProfile.name || '');
          setEmail(userProfile.email || '');
          setPhone(userProfile.phone || '');
          setAddress(userProfile.address || '');
          // Usar foto do owner se disponível, senão usar foto do perfil
          setAvatarUrl(owner?.avatarUrl || userProfile.avatarUrl || null);
        } else {
          // Se não existe perfil, usar dados do auth
          setName(user.email?.split('@')[0] || 'Usuário');
          setEmail(user.email || '');
          // Usar foto do owner se disponível
          setAvatarUrl(owner?.avatarUrl || null);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, user?.email, owner?.avatarUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: t('myAccount.imageSizeError') || 'A imagem deve ter no máximo 5MB' });
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErrors({ avatar: t('myAccount.invalidImage') || 'Por favor, selecione uma imagem válida' });
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
    setErrors({}); // Limpar erros anteriores
    try {
      const url = await storageService.uploadAvatar(croppedFile, user.id);
      
      // Atualizar estado local imediatamente
      setAvatarUrl(url);
      
      // Atualizar perfil no banco
      await userService.updateProfile(user.id, { avatarUrl: url });
      
      // Recarregar perfil para garantir sincronização
      const updated = await userService.getProfile(user.id);
      if (updated) {
        setProfile(updated);
        setAvatarUrl(updated.avatarUrl || null);
      }
      
      setIsUploading(false);
      setSelectedImageFile(null);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setErrors({ avatar: t('myAccount.uploadError') || 'Erro ao fazer upload da imagem. Tente novamente.' });
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const newErrors: Record<string, string> = {};

    if (!name || name.length < 3) {
      newErrors.name = t('myAccount.invalidName') || 'Por favor, insira um nome válido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await userService.updateProfile(user.id, {
        name,
        phone: phone || null,
        address: address || null,
        avatarUrl,
      });
      setErrors({});
      // Recarregar perfil
      const updated = await userService.getProfile(user.id);
      if (updated) setProfile(updated);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setErrors({ general: t('myAccount.saveError') || 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('myAccount.title')}</h1>

        <div className="space-y-6">
            {/* Foto */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t('myAccount.profilePhoto')}
              </label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="" 
                      className="w-full h-full object-cover object-center"
                      style={{ 
                        minWidth: '100%',
                        minHeight: '100%',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-300" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadIcon />
                  <span>{isUploading ? (t('myAccount.uploading') || 'Enviando...') : avatarUrl ? (t('myAccount.changePhoto') || 'Alterar Foto') : (t('myAccount.uploadPhoto') || 'Enviar Foto')}</span>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">O limite de upload é de 5MB</p>
              {errors.avatar && <p className="mt-2 text-sm text-red-600">{errors.avatar}</p>}
              {avatarUrl && !errors.avatar && (
                <p className="mt-2 text-sm text-green-600">{t('myAccount.photoUploadSuccess') || 'Foto enviada com sucesso!'}</p>
              )}
            </div>

            {/* Nome Completo */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('myAccount.fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({});
                }}
                placeholder={t('myAccount.fullNamePlaceholder') || 'Seu nome completo'}
                className={`
                  w-full h-12 px-4 rounded-[40px] border
                  ${errors.name ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('myAccount.email')}
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full h-12 px-4 rounded-[40px] border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                {/* Tooltip */}
                <div className="absolute left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                    {t('myAccount.emailTooltip')}
                    <div className="absolute left-4 top-full -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">{t('myAccount.emailCannotChange') || 'O email não pode ser alterado'}</p>
            </div>

            {/* Telefone */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('myAccount.phone')} ({t('common.optional') || 'opcional'})
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Endereço */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('myAccount.address')} ({t('common.optional') || 'opcional'})
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro, cidade - UF"
                className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? t('common.saving') : (t('myAccount.saveChanges') || 'Salvar Alterações')}
              </button>
            </div>
          </div>
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
    </>
  );
}