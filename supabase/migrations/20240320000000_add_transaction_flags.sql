-- 取引テーブルに新しいフラグを追加
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;

-- 既存のレコードを更新
UPDATE transactions
SET is_closed = TRUE,
    is_current = FALSE
WHERE created_at < NOW();

-- インデックスを追加して検索を最適化
CREATE INDEX IF NOT EXISTS idx_transactions_is_current ON transactions(is_current);
CREATE INDEX IF NOT EXISTS idx_transactions_is_closed ON transactions(is_closed);

-- 現在の取引が1つだけ存在することを保証するトリガー関数
CREATE OR REPLACE FUNCTION ensure_single_current_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = TRUE THEN
        -- 他の現在の取引をすべて非現在に設定
        UPDATE transactions
        SET is_current = FALSE
        WHERE id != NEW.id
        AND is_current = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
DROP TRIGGER IF EXISTS trigger_ensure_single_current_transaction ON transactions;
CREATE TRIGGER trigger_ensure_single_current_transaction
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_current_transaction(); 