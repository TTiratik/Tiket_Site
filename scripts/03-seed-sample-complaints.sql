-- Добавление примеров жалоб для тестирования
-- Добавляем тестовые жалобы
INSERT INTO complaints (user_id, user_nickname, violator_nickname, incident_date, evidence, status)
VALUES 
    ('user-001', 'TestUser1', 'BadPlayer123', '2024-01-15', 'Скриншот нарушения правил чата: https://example.com/screenshot1.png', 'active'),
    ('user-002', 'TestUser2', 'Cheater456', '2024-01-14', 'Видео использования читов: https://example.com/video1.mp4', 'active'),
    ('user-001', 'TestUser1', 'Spammer789', '2024-01-10', 'Логи спама в чате: множественные сообщения за короткий период', 'closed');

-- Добавляем тестовые сообщения в чат
INSERT INTO complaint_messages (complaint_id, sender_id, message, is_admin_message)
VALUES 
    (1, 'user-001', 'Здравствуйте, подаю жалобу на нарушение правил', false),
    (1, 'admin-001', 'Спасибо за обращение. Рассматриваем вашу жалобу.', true),
    (2, 'user-002', 'Обнаружил читера на сервере', false),
    (3, 'user-001', 'Пользователь спамил в чате', false),
    (3, 'admin-001', 'Жалоба рассмотрена. Нарушитель получил предупреждение. Жалоба закрыта.', true);
