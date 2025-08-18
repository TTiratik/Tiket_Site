-- Создание администратора по умолчанию
-- Вставляем администратора (замените данные на реальные)
INSERT INTO neon_auth.users_sync (id, email, name, role, created_at, updated_at)
VALUES (
    'admin-001',
    'admin@example.com',
    'Администратор',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- Добавляем несколько тестовых пользователей
INSERT INTO neon_auth.users_sync (id, email, name, role, created_at, updated_at)
VALUES 
    ('user-001', 'user1@example.com', 'Пользователь 1', 'user', NOW(), NOW()),
    ('user-002', 'user2@example.com', 'Пользователь 2', 'user', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
