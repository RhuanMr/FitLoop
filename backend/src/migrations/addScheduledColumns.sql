-- Migração para adicionar colunas de agendamento na tabela banners
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna scheduled_start se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'banners' 
        AND column_name = 'scheduled_start'
    ) THEN
        ALTER TABLE banners ADD COLUMN scheduled_start TIMESTAMP;
    END IF;
END $$;

-- Adicionar coluna scheduled_end se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'banners' 
        AND column_name = 'scheduled_end'
    ) THEN
        ALTER TABLE banners ADD COLUMN scheduled_end TIMESTAMP;
    END IF;
END $$;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'banners' 
ORDER BY ordinal_position;
