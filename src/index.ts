import * as inquirer from 'inquirer';

interface Item {
  name: string;
  price: number;
}

interface Category {
  [key: string]: Item;
}

interface Items {
  [key: string]: Item | Category;
}

interface Transaction {
  items: Item[];
  total: number;
}

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

async function main() {
  const transaction: Transaction = {
    items: [],
    total: 0
  };

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '操作を選択してください：',
        choices: ['商品を追加', '合計を表示', '終了']
      }
    ]);

    if (action === '終了') {
      break;
    }

    if (action === '商品を追加') {
      const { category } = await inquirer.prompt([
        {
          type: 'list',
          name: 'category',
          message: 'カテゴリを選択してください：',
          choices: Object.keys(items)
        }
      ]);

      let itemName: string;
      let price: number;

      if (category === 'ドリンク' || category === '回数券') {
        const { selectedItem } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedItem',
            message: category === 'ドリンク' ? 'ドリンクを選択してください：' : '回数券の種類を選択してください：',
            choices: Object.keys(items[category] as Category)
          }
        ]);
        itemName = selectedItem;
        price = (items[category] as Category)[selectedItem].price;
      } else {
        itemName = category;
        if (itemName === '席料' || itemName === 'その他') {
          const { customPrice } = await inquirer.prompt([
            {
              type: 'number',
              name: 'customPrice',
              message: '金額を入力してください：',
              validate: (input: number) => input > 0 || '0より大きい数を入力してください'
            }
          ]);
          price = customPrice;
        } else {
          price = (items[itemName] as Item).price;
        }
      }

      transaction.items.push({ name: itemName, price });
      transaction.total += price;
    }

    if (action === '合計を表示') {
      console.log('\n現在の取引内容：');
      transaction.items.forEach(item => {
        console.log(`${item.name}: ${item.price}円`);
      });
      console.log(`合計: ${transaction.total}円\n`);
    }
  }

  console.log('\n取引を終了します。');
  console.log('最終合計:', transaction.total, '円');
}

main().catch(console.error); 