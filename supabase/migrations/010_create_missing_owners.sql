-- ============================================
-- MIGRATION 010: Criar owners faltantes
-- Garante que todos os usuários tenham um owner
-- ============================================

-- Criar owner para todos os usuários que não têm
INSERT INTO family_members (user_id, name, role, is_active, color)
SELECT 
  u.id,
  u.name,
  'Owner',
  true,
  '#DBEAFE'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM family_members fm 
  WHERE fm.user_id = u.id 
  AND fm.role ILIKE 'owner' 
  AND fm.is_active = true
);
