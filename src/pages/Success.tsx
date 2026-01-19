import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter o tipo de sucesso (login ou signup) do state da navegação
  const isSignUp = (location.state as { isSignUp?: boolean })?.isSignUp ?? false;

  useEffect(() => {
    // Marcar que estamos vindo da tela de sucesso
    sessionStorage.setItem('fromSuccess', 'true');
    
    // Redirecionar para o dashboard após 2 segundos
    const redirectTimer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 2000);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

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
