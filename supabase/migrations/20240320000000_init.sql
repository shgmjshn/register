-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects if they exist
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS register_balance CASCADE;

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create register balance table
CREATE TABLE register_balance (
    id INTEGER PRIMARY KEY DEFAULT 1,
    cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
) WITH (
    OIDS = FALSE
);

-- Create indexes
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Add comments
COMMENT ON TABLE transactions IS '取引データを保存するテーブル';
COMMENT ON TABLE register_balance IS 'レジの残高を保存するテーブル';
COMMENT ON COLUMN transactions.id IS '取引の一意の識別子';
COMMENT ON COLUMN transactions.items IS '取引アイテムのJSON配列';
COMMENT ON COLUMN transactions.total IS '取引の合計金額';
COMMENT ON COLUMN transactions.created_at IS '取引の作成日時';

-- Enable Row Level Security
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE register_balance FORCE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON register_balance
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON register_balance
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON register_balance
    FOR UPDATE USING (true);

-- Grant permissions
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON transactions TO anon;
GRANT ALL ON register_balance TO authenticated;
GRANT ALL ON register_balance TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon; 