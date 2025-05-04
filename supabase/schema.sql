-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    is_current BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_is_current ON public.transactions(is_current);
CREATE INDEX IF NOT EXISTS idx_transactions_is_closed ON public.transactions(is_closed);

-- Create trigger function
CREATE OR REPLACE FUNCTION public.ensure_single_current_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = TRUE THEN
        UPDATE public.transactions
        SET is_current = FALSE
        WHERE id != NEW.id
        AND is_current = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_ensure_single_current_transaction ON public.transactions;
CREATE TRIGGER trigger_ensure_single_current_transaction
    BEFORE INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_current_transaction();

-- Set up Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON public.transactions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant access to authenticated and anonymous users
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO anon;
GRANT ALL ON public.transactions TO service_role; 