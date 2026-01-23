-- ============================================
-- MIGRATION 011: Criar registros faltantes na tabela users
-- Garante que todos os usuários autenticados tenham registro em public.users
-- ============================================

-- Criar registros na tabela users para usuários autenticados que não têm
INSERT INTO public.users (id, email, name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email) as name
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO NOTHING;
