import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { ImageCropModal } from '@/components/modals/ImageCropModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal/ConfirmModal';
import { Toast } from '@/components/ui/Toast/Toast';
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
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepValid, setCepValid] = useState(false);
  
  // Upload states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Toast states
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  
  // Delete confirmation modal
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

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
          
          // Carregar campos de endereço separados do banco
          setCep(userProfile.cep || '');
          setStreet(userProfile.street || '');
          setNumber(userProfile.addressNumber || '');
          setCity(userProfile.city || '');
          setState(userProfile.state || '');
          
          // Se tem CEP, considerar válido para mostrar campos
          setCepValid(!!userProfile.cep);
          // Usar avatar do perfil do usuário (que é sincronizado com owner via trigger)
          setAvatarUrl(userProfile.avatarUrl || null);
        } else {
          // Se não existe perfil, usar dados do auth (nome do sign-up)
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
          setName(fullName);
          setEmail(user.email || '');
          setPhone('');
          setCep('');
          setStreet('');
          setNumber('');
          setCity('');
          setState('');
          setCepValid(false);
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, user?.email, owner?.avatarUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ avatar: 'A imagem deve ter no máximo 10MB' });
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErrors({ avatar: t('myAccount.invalidImage') || 'Por favor, selecione uma imagem válida' });
      return;
    }

    // Se há foto atual, deletar antes de abrir o crop
    if (avatarUrl && user?.id) {
      try {
        console.log('🗑️ Deletando foto atual antes de trocar...');
        await storageService.deleteAvatar(user.id);
        await userService.deleteAvatar(user.id);
        setAvatarUrl(null);
        setProfile((prev) => prev ? { ...prev, avatarUrl: null } : null);
      } catch (error) {
        console.error('Erro ao deletar foto atual:', error);
        // Continuar mesmo se falhar ao deletar
      }
    }

    setSelectedImageFile(file);
    setIsCropModalOpen(true);
    setErrors({});
    
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!user?.id) {
      setErrors({ avatar: 'Usuário não autenticado' });
      return;
    }

    setIsUploading(true);
    setErrors({});

    try {
      // 1. Fazer upload da imagem
      console.log('📤 Fazendo upload do avatar...');
      const url = await storageService.uploadAvatar(croppedFile, user.id);
      
      if (!url) {
        throw new Error('URL não retornada do upload');
      }

      console.log('✅ Upload concluído, atualizando perfil...');

      // 2. Atualizar avatar no banco (o trigger vai sincronizar com owner automaticamente)
      const updatedProfile = await userService.updateAvatar(user.id, url);
      
      // 3. Atualizar estado local
      setProfile(updatedProfile);
      setAvatarUrl(updatedProfile.avatarUrl || url);

      console.log('✅ Avatar atualizado com sucesso!');
      
      setIsUploading(false);
      setSelectedImageFile(null);
      setIsCropModalOpen(false);
      setErrors({});

      // Mostrar toast de sucesso
      setToastMessage(t('myAccount.photoUploadSuccess') || 'Foto enviada com sucesso!');
      setIsToastVisible(true);
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload da imagem:', error);
      const errorMessage = error?.message || t('myAccount.uploadError') || 'Erro ao fazer upload da imagem. Tente novamente.';
      setErrors({ avatar: errorMessage });
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user?.id || !avatarUrl) return;

    setIsDeleting(true);
    setErrors({});

    try {
      // 1. Deletar arquivo do storage
      console.log('🗑️ Deletando avatar do storage...');
      await storageService.deleteAvatar(user.id);

      // 2. Atualizar banco (remover avatar_url)
      console.log('🗑️ Removendo avatar do banco...');
      const updatedProfile = await userService.deleteAvatar(user.id);

      // 3. Atualizar estado local
      setProfile(updatedProfile);
      setAvatarUrl(null);

      console.log('✅ Avatar deletado com sucesso!');

      // Mostrar toast de sucesso
      setToastMessage(t('myAccount.photoDeletedSuccess') || 'Foto deletada com sucesso!');
      setIsToastVisible(true);
    } catch (error: any) {
      console.error('❌ Erro ao deletar avatar:', error);
      const errorMessage = error?.message || t('myAccount.deleteError') || 'Erro ao deletar foto. Tente novamente.';
      setErrors({ avatar: errorMessage });
    } finally {
      setIsDeleting(false);
    }
  };

  // Buscar endereço por CEP
  const handleCepChange = async (value: string) => {
    // Remove caracteres não numéricos
    const cleanCep = value.replace(/\D/g, '');
    setCep(cleanCep);

    // Se tiver 8 dígitos, buscar endereço
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      setCepValid(false);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (data.erro) {
          setErrors({ cep: 'CEP não encontrado' });
          setCepValid(false);
          setLoadingCep(false);
          return;
        }

        // Preencher campos separados
        setStreet(data.logradouro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
        // Número não vem da API, deixar vazio para o usuário preencher
        setNumber('');
        setErrors({ ...errors, cep: '' });
        setCepValid(true); // CEP válido, mostrar outros campos
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setErrors({ cep: 'Erro ao buscar CEP. Tente novamente.' });
        setCepValid(false);
      } finally {
        setLoadingCep(false);
      }
    } else {
      setErrors({ ...errors, cep: '' });
      setCepValid(false);
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
      // Salvar campos separados de endereço
      await userService.updateProfile(user.id, {
        name,
        phone: phone || null,
        cep: cep && cep.length === 8 ? cep : null,
        street: street || null,
        addressNumber: number || null,
        city: city || null,
        state: state || null,
        // Manter address para compatibilidade (montado a partir dos campos)
        address: (() => {
          const addressParts = [];
          if (street) addressParts.push(street);
          if (number) addressParts.push(`nº ${number}`);
          if (city) addressParts.push(city);
          if (state) addressParts.push(state);
          let finalAddress = addressParts.length > 0 ? addressParts.join(', ') : null;
          if (cep && cep.length === 8) {
            const formattedCep = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
            finalAddress = finalAddress ? `${formattedCep} - ${finalAddress}` : formattedCep;
          }
          return finalAddress;
        })(),
      });
      setErrors({});
      // Recarregar perfil
      const updated = await userService.getProfile(user.id);
      if (updated) setProfile(updated);
      
      // Mostrar toast de sucesso
      setToastMessage(t('myAccount.saveSuccess') || 'Perfil atualizado com sucesso!');
      setIsToastVisible(true);
    } catch (error: any) {
      console.error('❌ Erro ao salvar perfil:', error);
      
      // Mensagem de erro mais específica
      let errorMessage = t('myAccount.saveError') || 'Erro ao salvar perfil. Tente novamente.';
      
      if (error?.code === '42703') {
        // Erro de coluna não existe (migration não aplicada)
        errorMessage = 'Erro: Campos de endereço não encontrados. Verifique se a migration 008 foi aplicada no banco de dados.';
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      setErrors({ general: errorMessage });
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
                <div className="flex items-center gap-3">
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
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirmModalOpen(true)}
                      disabled={isDeleting}
                      className="px-6 py-3 rounded-[40px] border border-red-300 text-red-600 hover:bg-red-50 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className={isDeleting ? 'animate-spin' : ''}
                      >
                        <path 
                          d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <path 
                          d="M10 11V17" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <path 
                          d="M14 11V17" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{t('myAccount.deletePhoto') || 'Deletar Foto'}</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">O limite de upload é de 10MB</p>
              {errors.avatar && <p className="mt-2 text-sm text-red-600">{errors.avatar}</p>}
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
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t('myAccount.address')} ({t('common.optional') || 'opcional'})
              </label>
              
              {/* CEP */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  CEP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={8}
                    className={`w-full h-12 px-4 rounded-[40px] border focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.cep ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {loadingCep && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    </div>
                  )}
                </div>
                {errors.cep && <p className="mt-1 text-sm text-red-600">{errors.cep}</p>}
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php?t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Não sei meu CEP
                </a>
              </div>

              {/* Campos de endereço - só aparecem quando CEP é válido */}
              {cepValid && (
                <>
                  {/* Logradouro/Rua e Número na mesma linha */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Logradouro/Rua
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Rua, Avenida, etc."
                        className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Número ({t('common.optional') || 'opcional'})
                      </label>
                      <input
                        type="text"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="123"
                        className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Cidade e UF na mesma linha */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Cidade"
                        className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        UF
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        placeholder="RJ"
                        maxLength={2}
                        className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </>
              )}
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

      {/* Modal de Confirmação de Delete */}
      <ConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleDeleteAvatar}
        title={t('myAccount.deletePhotoConfirmTitle') || 'Deletar Foto de Perfil'}
        message={t('myAccount.confirmDeletePhoto') || 'Tem certeza que deseja deletar sua foto de perfil?'}
        confirmText={t('myAccount.deleteConfirm') || 'Sim, deletar'}
        cancelText={t('common.cancel') || 'Cancelar'}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />

      {/* Toast de Sucesso */}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
        duration={5000}
      />
    </>
  );
}