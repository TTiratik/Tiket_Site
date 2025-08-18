-- Создание схемы для системы жалоб
-- Расширяем существующую таблицу пользователей полем роли
ALTER TABLE neon_auth.users_sync 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Создаем таблицу жалоб
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
    user_nickname VARCHAR(100) NOT NULL,
    violator_nickname VARCHAR(100) NOT NULL,
    incident_date DATE NOT NULL,
    evidence TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу сообщений для чата по жалобам
CREATE TABLE IF NOT EXISTS complaint_messages (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaint_messages_complaint_id ON complaint_messages(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_messages_created_at ON complaint_messages(created_at);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at в таблице complaints
DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints;
CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
