/**
 * POSレジシステムのメインコンポーネント
 * 
 * このファイルは以下の主要な機能を提供します：
 * 1. 商品管理：商品マスタの定義と管理
 * 2. 取引管理：現在の取引状態の管理と更新
 * 3. 売上管理：日次売上の集計と表示
 * 4. レジ残高管理：現金残高の管理と更新
 * 5. リアルタイム同期：Supabaseを使用したデータのリアルタイム更新
 */

import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from './lib/supabase';

// 商品アイテムの型定義
interface Item {
  name: string;
  price: number;
}

// カテゴリの型定義
interface Category {
  [key: string]: Item;
}

// 商品マスタの型定義
interface Items {
  [key: string]: Item | Category;
}

// 取引データの型定義
interface Transaction {
  id?: string;
  items: Item[];
  total: number;
  created_at?: string;
  is_closed?: boolean;  // レジ締め状態を管理
  is_current?: boolean;  // 現在の取引かどうかを示すフラグ
}

// 日次売上の型定義
interface DailySales {
  date: string;
  transactions: Transaction[];
  total: number;
}

// レジ残高の型定義
interface RegisterBalance {
  id: string;
  cash: number;
  last_updated: string;
}

// 商品マスタデータ
const items: Items = {
  '席料': { name: '席料', price: 0 },
  '回数券': {
    '一般': { name: '一般回数券', price: 4750 },
    '女性': { name: '女性回数券', price: 3750 },
    '高校生以下': { name: '高校生以下回数券', price: 3250 }
  },
  'ドリンク': {
    'ビール': { name: 'ビール', price: 500 },
    'チューハイ': { name: 'チューハイ', price: 300 },
    'ペットボトル': { name: 'ペットボトル', price: 120 },
    '缶・コーヒー': { name: '缶・コーヒー', price: 100 }
  },
  'その他': { name: 'その他', price: 0 }
};

// メインのアプリケーションコンポーネント
export function App() {
  // ステート管理
  // 各ステートは特定の機能を管理するために使用されます
  // 現在の取引状態を管理するステート
  const [transaction, setTransaction] = useState<Transaction>({
    items: [],
    total: 0
  });
  // その他商品の金額入力を管理するステート
  const [customPrice, setCustomPrice] = useState<string>('');
  // 選択されたカテゴリを管理するステート
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  // 選択された商品を管理するステート
  const [selectedItem, setSelectedItem] = useState<string>('');
  // 受け取った金額を管理するステート
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  // 日次売上データを管理するステート
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  // 売上履歴の表示/非表示を管理するステート
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  // ローディング状態を管理するステート
  const [isLoading, setIsLoading] = useState(false);
  // 編集対象の取引を管理するステート
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  // 編集モーダルの表示/非表示を管理するステート
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // レジ残高を管理するステート
  const [registerBalance, setRegisterBalance] = useState<RegisterBalance>({
    id: '1',
    cash: 0,
    last_updated: new Date().toISOString()
  });
  // 支出金額を管理するステート
  const [expenseAmount, setExpenseAmount] = useState('');

  // コンポーネントマウント時の初期化処理
  // 売上履歴の取得とリアルタイム同期の設定を行います
  useEffect(() => {
    // 初期データの取得
    fetchCurrentTransaction();
    fetchSalesHistory();
    fetchRegisterBalance();

    // リアルタイム更新の購読
    const subscription = supabase
      .channel('current_transaction')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: 'is_current=eq.true'
      }, (payload) => {
        console.log('リアルタイム更新を受信:', payload);
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setTransaction(payload.new as Transaction);
        } else if (payload.eventType === 'DELETE') {
          setTransaction({ items: [], total: 0, is_current: true });
        }
      })
      .subscribe();

    return () => {
      console.log('コンポーネントアンマウント: 購読解除');
      subscription.unsubscribe();
    };
  }, []);

  // 現在の取引を取得する関数
  // Supabaseから現在の取引データを取得し、存在しない場合は新規作成します
  const fetchCurrentTransaction = async () => {
    try {
      console.log('現在の取引を取得中...');
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .filter('is_current', 'eq', true)
        .maybeSingle();

      console.log('取得結果:', { data, error });

      if (error) {
        console.error('取引取得エラー:', error);
        if (error.code === 'PGRST116') {
          // データが存在しない場合は新しい取引を作成
          const newTransaction = { items: [], total: 0, is_current: true };
          console.log('新しい取引を作成:', newTransaction);
          
          // 新しい取引をデータベースに保存
          const { error: insertError } = await supabase
            .from('transactions')
            .insert([newTransaction]);

          if (insertError) throw insertError;
          
          setTransaction(newTransaction);
          return;
        }
        throw error;
      }

      if (data) {
        console.log('取引データを設定:', data);
        setTransaction(data);
      } else {
        console.log('取引データなし、新しい取引を作成');
        const newTransaction = { items: [], total: 0, is_current: true };
        
        // 新しい取引をデータベースに保存
        const { error: insertError } = await supabase
          .from('transactions')
          .insert([newTransaction]);

        if (insertError) throw insertError;
        
        setTransaction(newTransaction);
      }
    } catch (error) {
      console.error('現在の取引の取得に失敗しました:', error);
      alert('現在の取引の取得に失敗しました');
    }
  };

  // 売上履歴をSupabaseから取得する関数
  // 日付ごとに取引をグループ化し、合計金額を計算します
  const fetchSalesHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

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
      alert(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // レジ残高を取得する関数
  // 現在のレジ残高をSupabaseから取得します
  const fetchRegisterBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('register_balance')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // データが存在しない場合は初期化
          const initialBalance = {
            id: '1',
            cash: 0,
            last_updated: new Date().toISOString()
          };
          
          // 既存のデータを確認
          const { data: existingData } = await supabase
            .from('register_balance')
            .select('*')
            .limit(1);

          if (!existingData || existingData.length === 0) {
            const { error: insertError } = await supabase
              .from('register_balance')
              .insert([initialBalance]);
            
            if (insertError) throw insertError;
            setRegisterBalance(initialBalance);
          } else {
            setRegisterBalance(existingData[0]);
          }
          return;
        }
        throw error;
      }

      setRegisterBalance(data);
    } catch (error) {
      console.error('レジ残高の取得に失敗しました:', error);
      alert('レジ残高の取得に失敗しました');
    }
  };

  // 商品を取引に追加する関数
  // 選択された商品を現在の取引に追加し、合計金額を更新します
  const handleAddItem = async () => {
    if (!selectedCategory) return;
    
    let price: number;
    let itemName: string;

    if (selectedCategory === 'ドリンク' || selectedCategory === '回数券') {
      if (!selectedItem) return;
      itemName = selectedItem;
      price = (items[selectedCategory] as Category)[selectedItem].price;
    } else {
      itemName = selectedCategory;
      if (itemName === '席料' || itemName === 'その他') {
        price = Number(customPrice);
        if (price <= 0) return;
      } else {
        price = (items[itemName] as Item).price;
      }
    }

    const newTransaction = {
      ...transaction,
      items: [...transaction.items, { name: itemName, price }],
      total: transaction.total + price,
      is_current: true
    };

    console.log('新しい取引データ:', newTransaction);

    try {
      setIsLoading(true);
      if (transaction.id) {
        // 既存の取引を更新
        console.log('既存の取引を更新:', transaction.id);
        const { error } = await supabase
          .from('transactions')
          .update(newTransaction)
          .eq('id', transaction.id);

        if (error) throw error;
      } else {
        // 新しい取引を作成
        console.log('新しい取引を作成');
        const { error } = await supabase
          .from('transactions')
          .insert([newTransaction]);

        if (error) throw error;
      }

      setTransaction(newTransaction);
      setSelectedCategory('');
      setSelectedItem('');
      setCustomPrice('');
    } catch (error) {
      console.error('取引の更新に失敗しました:', error);
      alert(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // お釣りを計算する関数
  // 受け取った金額から合計金額を引いてお釣りを計算します
  const calculateChange = () => {
    const received = Number(receivedAmount);
    if (received < transaction.total) return '金額が不足しています';
    return received - transaction.total;
  };

  // レジ締め処理を行う関数
  // 現在の取引を確定し、新しい取引を開始します
  const handleCloseRegister = async () => {
    if (transaction.items.length === 0) return;

    try {
      setIsLoading(true);

      // 現在の取引を確定（is_currentをfalseに設定）
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          is_current: false,
          is_closed: true
        })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      // レジ残高を更新
      const newBalance = {
        id: registerBalance.id,
        cash: registerBalance.cash + transaction.total,
        last_updated: new Date().toISOString()
      };

      const { error: balanceError } = await supabase
        .from('register_balance')
        .update(newBalance)
        .eq('id', registerBalance.id);

      if (balanceError) throw balanceError;

      setRegisterBalance(newBalance);
      await fetchSalesHistory();

      // 新しい取引を開始
      const newTransaction = { items: [], total: 0, is_current: true };
      setTransaction(newTransaction);
      setReceivedAmount('');
    } catch (error) {
      console.error('レジ締めに失敗しました:', error);
      alert('レジ締めに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 取引を更新する関数
  // 既存の取引データを更新します
  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('transactions')
        .update({
          items: updatedTransaction.items,
          total: updatedTransaction.total
        })
        .eq('id', updatedTransaction.id);

      if (error) throw error;

      await fetchSalesHistory();
      setIsEditModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('取引の更新に失敗しました:', error);
      alert(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // 取引を削除する関数
  // 指定された取引を削除します
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('この取引を削除してもよろしいですか？')) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      await fetchSalesHistory();
    } catch (error) {
      console.error('取引の削除に失敗しました:', error);
      alert(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // 編集モーダルを開く関数
  // 取引の編集モーダルを表示します
  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // 支出を記録する関数
  // レジからの支出を記録し、残高を更新します
  const handleExpense = async () => {
    const amount = Number(expenseAmount);
    if (amount <= 0 || amount > registerBalance.cash) return;

    try {
      setIsLoading(true);

      // レジ残高を更新
      const newBalance = {
        id: registerBalance.id,
        cash: registerBalance.cash - amount,
        last_updated: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('register_balance')
        .update(newBalance)
        .eq('id', registerBalance.id);

      if (updateError) throw updateError;

      setRegisterBalance(newBalance);
      setExpenseAmount('');
      alert(`${amount.toLocaleString()}円の支出を記録しました`);
    } catch (error) {
      console.error('支出の記録に失敗しました:', error);
      alert('支出の記録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントのレンダリング
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">会計システム</h1>
      
      {/* レジ残高表示セクション */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">レジ残高</h2>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold">{registerBalance.cash.toLocaleString()}円</div>
            <div className="text-sm text-gray-500">
              最終更新: {new Date(registerBalance.last_updated).toLocaleString('ja-JP')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="支出金額"
              className="border p-2 rounded w-32"
              min="0"
            />
            <button
              onClick={handleExpense}
              disabled={!expenseAmount || Number(expenseAmount) <= 0 || Number(expenseAmount) > registerBalance.cash}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-300 transition-colors"
            >
              支出
            </button>
          </div>
        </div>
      </div>

      {/* 商品選択と追加セクション */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">商品選択</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedItem('');
            }}
            className="border p-2 rounded flex-1 min-w-[200px]"
            disabled={isLoading}
          >
            <option value="">カテゴリを選択</option>
            {Object.keys(items).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* ドリンクまたは回数券の場合、サブカテゴリを表示 */}
          {(selectedCategory === 'ドリンク' || selectedCategory === '回数券') && (
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="border p-2 rounded flex-1 min-w-[200px]"
              disabled={isLoading}
            >
              <option value="">{selectedCategory === 'ドリンク' ? 'ドリンク' : '回数券'}を選択</option>
              {Object.keys(items[selectedCategory] as Category).map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          )}

          {/* 席料またはその他の場合、金額入力フィールドを表示 */}
          {(selectedCategory === '席料' || selectedCategory === 'その他') && (
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="金額を入力"
              className="border p-2 rounded flex-1 min-w-[200px]"
              disabled={isLoading}
            />
          )}

          <button
            onClick={handleAddItem}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            追加
          </button>
        </div>
      </div>

      {/* 現在の取引内容表示セクション */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">現在の取引内容</h2>
        <div className="space-y-2">
          {transaction.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{item.name}</span>
              <span className="font-medium">{item.price.toLocaleString()}円</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>合計</span>
              <span>{transaction.total.toLocaleString()}円</span>
            </div>
          </div>
        </div>
      </div>

      {/* 支払い処理セクション */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">お支払い</h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            placeholder="受け取った金額"
            className="border p-2 rounded flex-1"
            disabled={isLoading}
          />
          <span className="font-medium">円</span>
        </div>
        {receivedAmount && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="font-bold text-lg">
              おつり: {typeof calculateChange() === 'number' ? `${calculateChange().toLocaleString()}円` : calculateChange()}
            </div>
          </div>
        )}
      </div>

      {/* レジ締めと売上履歴表示セクション */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleCloseRegister}
          disabled={transaction.items.length === 0 || isLoading}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex-1 disabled:bg-gray-300 transition-colors"
        >
          {isLoading ? '処理中...' : 'レジ締め'}
        </button>
        <button
          onClick={() => setShowSalesHistory(!showSalesHistory)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex-1 transition-colors"
          disabled={isLoading}
        >
          {showSalesHistory ? '売上履歴を隠す' : '売上履歴を表示'}
        </button>
      </div>

      {/* 売上履歴表示セクション */}
      {showSalesHistory && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">売上履歴</h2>
          {isLoading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : (
            dailySales.map((day, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <h3 className="font-bold text-lg mb-3 pb-2 border-b">{day.date}</h3>
                <div className="space-y-4">
                  {day.transactions.map((transaction, tIndex) => (
                    <div key={tIndex} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">取引 {tIndex + 1}</div>
                        <div className="space-x-2">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            disabled={isLoading}
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id!)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            disabled={isLoading}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {transaction.items.map((item, iIndex) => (
                          <div key={iIndex} className="flex justify-between items-center text-sm">
                            <span>{item.name}</span>
                            <span>{item.price.toLocaleString()}円</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center font-bold pt-2 border-t mt-2">
                          <span>小計</span>
                          <span>{transaction.total.toLocaleString()}円</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center font-bold text-lg pt-2 border-t mt-4">
                    <span>日計</span>
                    <span>{day.total.toLocaleString()}円</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 編集モーダル */}
      {isEditModalOpen && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">取引の編集</h3>
            <div className="space-y-4">
              {editingTransaction.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...editingTransaction.items];
                      newItems[index] = { ...item, name: e.target.value };
                      setEditingTransaction({
                        ...editingTransaction,
                        items: newItems,
                        total: newItems.reduce((sum, item) => sum + item.price, 0)
                      });
                    }}
                    className="border p-2 rounded flex-1"
                    placeholder="商品名"
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => {
                      const newItems = [...editingTransaction.items];
                      newItems[index] = { ...item, price: Number(e.target.value) };
                      setEditingTransaction({
                        ...editingTransaction,
                        items: newItems,
                        total: newItems.reduce((sum, item) => sum + item.price, 0)
                      });
                    }}
                    className="border p-2 rounded w-32"
                    placeholder="金額"
                  />
                  <button
                    onClick={() => {
                      const newItems = editingTransaction.items.filter((_, i) => i !== index);
                      setEditingTransaction({
                        ...editingTransaction,
                        items: newItems,
                        total: newItems.reduce((sum, item) => sum + item.price, 0)
                      });
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors"
                  >
                    削除
                  </button>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={() => {
                    const newItems = [...editingTransaction.items, { name: '', price: 0 }];
                    setEditingTransaction({
                      ...editingTransaction,
                      items: newItems,
                      total: newItems.reduce((sum, item) => sum + item.price, 0)
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                >
                  項目を追加
                </button>
                <div className="font-bold text-lg">
                  合計: {editingTransaction.total.toLocaleString()}円
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTransaction(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleUpdateTransaction(editingTransaction)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
                  disabled={isLoading}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 