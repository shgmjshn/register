import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

interface Item {
  name: string;
  price: number;
}

interface Transaction {
  id?: string;
  items: Item[];
  total: number;
  created_at?: string;
}

interface DailySales {
  date: string;
  transactions: Transaction[];
  total: number;
}

const items: { [key: string]: Item } = {
  '席料': { name: '席料', price: 1000 },
  '回数券': { name: '回数券', price: 5000 },
  'その他': { name: 'その他', price: 0 }
};

export function App() {
  const [transaction, setTransaction] = useState<Transaction>({
    items: [],
    total: 0
  });
  const [customPrice, setCustomPrice] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const fetchSalesHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 日付ごとにデータをグループ化
      const groupedData = data.reduce((acc: { [key: string]: DailySales }, curr: Transaction) => {
        const date = new Date(curr.created_at!).toLocaleDateString('ja-JP');
        if (!acc[date]) {
          acc[date] = {
            date,
            transactions: [],
            total: 0
          };
        }
        acc[date].transactions.push(curr);
        acc[date].total += curr.total;
        return acc;
      }, {});

      setDailySales(Object.values(groupedData));
    } catch (error) {
      console.error('売上履歴の取得に失敗しました:', error);
      alert('売上履歴の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedItem) return;
    
    let price = items[selectedItem].price;
    if (selectedItem === 'その他') {
      price = Number(customPrice);
      if (price <= 0) return;
    }

    setTransaction(prev => ({
      items: [...prev.items, { name: selectedItem, price }],
      total: prev.total + price
    }));
    setSelectedItem('');
    setCustomPrice('');
  };

  const calculateChange = () => {
    const received = Number(receivedAmount);
    if (received < transaction.total) return '金額が不足しています';
    return received - transaction.total;
  };

  const handleCloseRegister = async () => {
    if (transaction.items.length === 0) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('transactions')
        .insert([transaction]);

      if (error) throw error;

      // 売上履歴を更新
      await fetchSalesHistory();

      // 取引をリセット
      setTransaction({ items: [], total: 0 });
      setReceivedAmount('');
    } catch (error) {
      console.error('レジ締めに失敗しました:', error);
      alert('レジ締めに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">会計システム</h1>
      
      <div className="mb-4">
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="border p-2 rounded mr-2"
          disabled={isLoading}
        >
          <option value="">商品を選択</option>
          {Object.keys(items).map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        {selectedItem === 'その他' && (
          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="金額を入力"
            className="border p-2 rounded mr-2"
            disabled={isLoading}
          />
        )}

        <button
          onClick={handleAddItem}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          disabled={isLoading}
        >
          追加
        </button>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">現在の取引内容：</h2>
        {transaction.items.map((item, index) => (
          <div key={index} className="mb-1">
            {item.name}: {item.price}円
          </div>
        ))}
        <div className="font-bold mt-2">
          合計: {transaction.total}円
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">お支払い：</h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            placeholder="受け取った金額"
            className="border p-2 rounded"
            disabled={isLoading}
          />
          <span>円</span>
        </div>
        {receivedAmount && (
          <div className="mt-2">
            <div className="font-bold">
              おつり: {typeof calculateChange() === 'number' ? `${calculateChange()}円` : calculateChange()}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleCloseRegister}
          disabled={transaction.items.length === 0 || isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? '処理中...' : 'レジ締め'}
        </button>
        <button
          onClick={() => setShowSalesHistory(!showSalesHistory)}
          className="bg-gray-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {showSalesHistory ? '売上履歴を隠す' : '売上履歴を表示'}
        </button>
      </div>

      {showSalesHistory && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">売上履歴：</h2>
          {isLoading ? (
            <div>読み込み中...</div>
          ) : (
            dailySales.map((day, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="font-bold">{day.date}</div>
                <div>取引数: {day.transactions.length}件</div>
                <div>合計売上: {day.total}円</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 