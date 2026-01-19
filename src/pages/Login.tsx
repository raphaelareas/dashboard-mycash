import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp } = useAuth();

  // Efeito para gerenciar o redirecionamento após sucesso
  useEffect(() => {
    if (success) {
      // Mostrar feedback de sucesso por 2 segundos, depois redirecionar
      const redirectTimer = setTimeout(() => {
        window.location.href = '/';
      }, 2000);

      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
        setError(null);
        setLoading(true);
        setSuccess(false);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Por favor, informe seu nome');
          setLoading(false);
          return;
        }
        if (!acceptedTerms) {
          setError('Você precisa aceitar os termos de uso para criar uma conta');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message || 'Erro ao criar conta');
          setLoading(false);
        } else {
          // Signup bem-sucedido - mostrar feedback (sem loading)
          setSuccess(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          // Tratamento específico para erro de e-mail não confirmado
          let errorMessage = error.message || 'Email ou senha inválidos';
          
          if (error.message?.includes('Email not confirmed') || 
              error.message?.includes('email_not_confirmed') ||
              error.message?.toLowerCase().includes('email') && error.message?.toLowerCase().includes('confirm')) {
            errorMessage = 'E-mail não confirmado. Verifique sua caixa de entrada e confirme seu e-mail antes de fazer login.';
          } else if (error.message?.includes('Invalid login credentials')) {
            errorMessage = 'Email ou senha inválidos';
          }
          
          setError(errorMessage);
          setLoading(false);
        } else {
          // Login bem-sucedido - mostrar feedback (sem loading)
          setSuccess(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado');
      setLoading(false);
    }
  };


  // Tela de feedback de sucesso
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          {/* Ícone de check com fundo verde claro (estilo IncomeCard) */}
          <div className="mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-900" style={{ backgroundColor: '#D1FAE4' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 13.5L3.75 9.75L2.84 10.66L7.5 15.33L17.5 5.33L16.59 4.42L7.5 13.5Z" fill="#10B981" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Texto de sucesso */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isSignUp ? 'Conta criada com sucesso' : 'Logado com sucesso'}
            </h2>
            
            {/* Loading centralizado */}
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg width="132" height="40" viewBox="0 0 188 29" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.748 0.584961C14.9777 0.346015 15.4307 0.475343 15.4307 0.901367V11.5879L14.8086 12.2344H14.8096L14.1885 12.8809C12.8434 14.2804 13.7601 16.7324 15.7441 16.7324H32.1035L22.626 26.5928C22.0626 27.179 21.3008 27.5048 20.5117 27.5049H8.66406C1.40371 27.5047 -2.30879 18.3296 2.88281 12.9287L14.748 0.584961ZM28.5664 0.540039H40.4141C47.6744 0.540222 51.3869 9.71538 46.1953 15.1162L34.3301 27.46C34.1004 27.6989 33.6475 27.5696 33.6475 27.1436V16.4561L34.2686 15.8105L34.8896 15.1641C36.2347 13.7646 35.318 11.3125 33.334 11.3125H16.9736L26.4521 1.45215C27.0156 0.866024 27.7774 0.540167 28.5664 0.540039Z" fill="black" stroke="black" strokeWidth="0.922165"/>
              <path d="M178.704 20.8463V6.00781H182.455V20.8463H178.704ZM173.16 15.3028V11.5513H187.999V15.3028H173.16Z" fill="#080B12"/>
              <path d="M158.382 12.7037V22.0091H153.918V0.547852H158.256V8.75303H158.445C158.808 7.80292 159.395 7.0589 160.205 6.52097C161.016 5.97605 162.032 5.70359 163.255 5.70359C164.373 5.70359 165.347 5.94811 166.179 6.43713C167.017 6.91917 167.667 7.61429 168.128 8.52248C168.596 9.42369 168.826 10.503 168.819 11.7605V22.0091H164.355V12.557C164.362 11.5649 164.111 10.793 163.601 10.2411C163.098 9.68916 162.392 9.41321 161.484 9.41321C160.876 9.41321 160.338 9.54245 159.87 9.80094C159.409 10.0594 159.046 10.4367 158.78 10.9327C158.522 11.4217 158.389 12.012 158.382 12.7037Z" fill="#080B12"/>
              <path d="M150.742 10.5033L147.709 10.6899C147.105 10.7271 146.589 10.2784 146.204 9.81168C145.974 9.52525 145.67 9.29821 145.293 9.13054C144.922 8.95589 144.479 8.86856 143.962 8.86856C143.27 8.86856 142.687 9.01527 142.212 9.30868C141.737 9.59511 141.499 9.97935 141.499 10.4614C141.499 10.8456 141.653 11.1705 141.96 11.436C142.268 11.7014 142.795 11.9145 143.542 12.0752L146.456 12.662C148.021 12.9834 149.187 13.5003 149.956 14.2129C150.724 14.9255 151.108 15.8616 151.108 17.0213C151.108 18.0762 150.798 19.0019 150.176 19.7983C149.561 20.5947 148.716 21.2165 147.64 21.6636C146.571 22.1037 145.338 22.3238 143.941 22.3238C141.81 22.3238 140.112 21.8802 138.848 20.9929C137.59 20.0987 136.853 18.8831 136.637 17.3462L139.209 17.2112C140.254 17.1563 141.122 18.0202 141.992 18.6037C142.502 18.939 143.155 19.1067 143.951 19.1067C144.734 19.1067 145.362 18.9565 145.837 18.6561C146.319 18.3487 146.564 17.954 146.571 17.4719C146.564 17.0667 146.393 16.7349 146.057 16.4764C145.722 16.211 145.205 16.0084 144.507 15.8686L141.719 15.3132C140.147 14.9989 138.977 14.4539 138.209 13.6785C137.447 12.903 137.066 11.9145 137.066 10.7129C137.066 9.67895 137.346 8.78822 137.905 8.04071C138.471 7.2932 139.263 6.71684 140.283 6.31165C141.31 5.90645 142.512 5.70386 143.888 5.70386C145.921 5.70386 147.521 6.1335 148.688 6.99279C149.861 7.85208 150.546 9.02226 150.742 10.5033Z" fill="#080B12"/>
              <path d="M124.821 22.3133C123.794 22.3133 122.879 22.1352 122.075 21.7789C121.272 21.4156 120.636 20.8812 120.168 20.1756C119.707 19.463 119.477 18.5757 119.477 17.5139C119.477 16.6196 119.641 15.8686 119.969 15.2608C120.297 14.6531 120.745 14.164 121.31 13.7938C121.876 13.4235 122.519 13.1441 123.239 12.9554C123.965 12.7668 124.727 12.6341 125.523 12.5572C126.459 12.4594 127.214 12.3686 127.787 12.2848C128.359 12.1939 128.775 12.0612 129.034 11.8866C129.292 11.7119 129.421 11.4534 129.421 11.1111V11.0482C129.421 10.3845 129.212 9.87107 128.793 9.50779C128.38 9.14451 127.794 8.96287 127.032 8.96287C126.229 8.96287 125.589 9.14102 125.114 9.49731C124.639 9.84661 124.325 10.2867 124.171 10.8177L120.042 10.4823C120.252 9.50429 120.664 8.65898 121.279 7.9464C121.894 7.22683 122.687 6.67492 123.658 6.29069C124.636 5.89947 125.768 5.70386 127.053 5.70386C127.947 5.70386 128.803 5.80865 129.62 6.01823C130.445 6.22781 131.175 6.55267 131.811 6.99279C132.453 7.43292 132.96 7.99879 133.33 8.69041C133.7 9.37505 133.885 10.1959 133.885 11.153V22.0094H129.652V19.7774H129.526C129.268 20.2804 128.922 20.724 128.489 21.1082C128.055 21.4855 127.535 21.7824 126.927 21.9989C126.319 22.2085 125.617 22.3133 124.821 22.3133ZM126.099 19.2324C126.756 19.2324 127.336 19.1032 127.839 18.8447C128.342 18.5792 128.737 18.2229 129.023 17.7758C129.309 17.3287 129.453 16.8222 129.453 16.2564V15.1789C129.453 14.9074 129.135 14.7183 128.876 14.7998C128.639 14.8696 128.37 14.936 128.069 14.9989C127.769 15.0548 127.469 15.1071 127.168 15.156C126.868 15.198 126.595 15.2364 126.351 15.2713C125.827 15.3482 125.369 15.4704 124.978 15.6381C124.587 15.8058 124.283 16.0328 124.066 16.3192C123.85 16.5987 123.742 16.948 123.742 17.3671C123.742 17.9749 123.962 18.4395 124.402 18.7609C124.849 19.0753 125.415 19.2324 126.099 19.2324Z" fill="#080B12"/>
              <path d="M110.184 22.3238C108.535 22.3238 107.117 21.9745 105.929 21.2759C104.749 20.5703 103.841 19.5922 103.205 18.3417C102.576 17.0912 102.262 15.6521 102.262 14.0243C102.262 12.3756 102.58 10.9295 103.215 9.68593C103.858 8.43542 104.770 7.46086 105.950 6.76225C107.131 6.05666 108.535 5.70386 110.163 5.70386C111.567 5.70386 112.797 5.95885 113.852 6.46883C114.907 6.97882 115.741 7.69490 116.356 8.61706C116.971 9.53923 117.310 10.6221 117.373 11.8656H114.752C113.837 11.8656 113.125 11.1413 112.608 10.3874C112.494 10.2209 112.363 10.0675 112.217 9.92695C111.714 9.43094 111.054 9.18293 110.236 9.18293C109.545 9.18293 108.940 9.37156 108.423 9.74881C107.913 10.1191 107.515 10.6605 107.229 11.3731C106.942 12.0857 106.799 12.9484 106.799 13.9614C106.799 14.9884 106.939 15.8616 107.218 16.5812C107.505 17.3008 107.906 17.8492 108.423 18.2264C108.940 18.6037 109.545 18.7923 110.236 18.7923C110.746 18.7923 111.204 18.6875 111.609 18.4779C112.021 18.2684 112.360 17.9645 112.626 17.5663C112.898 17.1611 113.076 16.6755 113.160 16.1097H117.373C117.303 17.3392 116.967 18.4221 116.367 19.3582C115.773 20.2873 114.952 21.0139 113.904 21.5379C112.856 22.0618 111.616 22.3238 110.184 22.3238Z" fill="#080B12"/>
              <path d="M88.8938 28.0453C88.328 28.0453 87.797 27.9999 87.301 27.9091C86.812 27.8252 86.4068 27.7169 86.0854 27.5842L87.0914 24.2518C87.6154 24.4125 88.087 24.4998 88.5061 24.5138C88.9323 24.5278 89.299 24.43 89.6064 24.2204C89.9208 24.0108 90.1758 23.6545 90.3714 23.1515L90.6334 22.4704L84.8594 5.91333H89.554L92.8864 17.7338H93.0541L96.4179 5.91333H101.144L94.8879 23.7488C94.5875 24.6151 94.1788 25.3696 93.6619 26.0123C93.1519 26.662 92.5057 27.1616 91.7232 27.5109C90.9408 27.8671 89.9977 28.0453 88.8938 28.0453Z" fill="#080B12"/>
              <path d="M59.2227 0.547852H64.8185L70.7288 14.9672H70.9803L76.8905 0.547852H82.4864V22.0091H78.0851V8.04044H77.907L72.353 21.9044H69.356L63.802 7.98805H63.6239V22.0091H59.2227V0.547852Z" fill="#080B12"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp 
              ? 'Comece a gerenciar suas finanças hoje' 
              : 'Entre na sua conta para continuar'}
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-4 pr-12 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3C5 3 1.73 7.11 1 10C1.73 12.89 5 17 10 17C15 17 18.27 12.89 19 10C18.27 7.11 15 3 10 3ZM10 15C7.24 15 5 12.76 5 10C5 7.24 7.24 5 10 5C12.76 5 15 7.24 15 10C15 12.76 12.76 15 10 15ZM10 7C8.34 7 7 8.34 7 10C7 11.66 8.34 13 10 13C11.66 13 13 11.66 13 10C13 8.34 11.66 7 10 7Z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.71 3.16L1.29 1.75L15.29 15.75L16.71 14.34C16.8 14.24 16.88 14.13 16.95 14.01C17.68 11.89 14.27 9 10 9C9.6 9 9.21 9.02 8.84 9.06L7.23 7.45C7.75 6.87 8.33 6.35 8.97 5.9C7.5 5.4 6.2 5.2 5.05 5.2C4.5 5.2 3.95 5.25 3.4 5.35L2.71 3.16ZM10 7C12.76 7 15 9.24 15 12C15 12.64 14.87 13.26 14.64 13.82L12.82 12C12.93 11.68 13 11.35 13 11C13 9.34 11.66 8 10 8C9.65 8 9.32 8.07 9 8.18L7.18 6.36C7.74 6.13 8.36 6 9 6H10V7ZM1.73 7.55C1.55 7.75 1.38 7.95 1.23 8.16C0.52 9.11 0 10.11 0 11C0 12.89 3.23 17 7 17C7.64 17 8.26 16.87 8.82 16.64L7.45 15.27C7.02 15.42 6.52 15.5 6 15.5C3.24 15.5 1 13.26 1 10.5C1 9.85 1.13 9.23 1.36 8.67L1.73 7.55ZM10 15C9.36 15 8.74 14.87 8.18 14.64L9.55 13.27C9.98 13.42 10.48 13.5 11 13.5C13.76 13.5 16 11.26 16 8.5C16 7.85 15.87 7.23 15.64 6.67L17.27 5.04C17.45 5.24 17.62 5.44 17.77 5.65C18.48 6.6 19 7.6 19 8.5C19 10.39 15.77 14.5 12 14.5C11.36 14.5 10.74 14.37 10.18 14.14L8.82 15.5H10V15Z" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            {isSignUp && (
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  Eu concordo com os{' '}
                  <a href="#" className="underline transition-colors hover:[color:#99B402]" style={{ color: '#080B12' }} onClick={(e) => e.preventDefault()}>
                    termos de uso
                  </a>{' '}
                  do aplicativo
                </label>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full h-14 font-medium rounded-[40px] transition-all disabled:cursor-not-allowed ${
                success
                  ? 'bg-green-600 text-white'
                  : 'bg-black text-white hover:bg-gray-800 disabled:opacity-50'
              }`}
            >
              {success 
                ? (isSignUp ? '✓ Conta criada com sucesso!' : '✓ Login realizado com sucesso!')
                : loading 
                  ? 'Processando...' 
                  : isSignUp 
                    ? 'Criar conta' 
                    : 'Entrar'
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {isSignUp ? (
                <>Já tem uma conta? <span className="font-medium">Entre aqui</span></>
              ) : (
                <>Não tem uma conta? <span className="font-medium">Crie uma</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
