import * as inquirer from 'inquirer';

interface Item {
  name: string;
  price: number;
}

interface Transaction {
  items: Item[];
  total: number;
}

const items: { [key: string]: Item } = {
  '席料': { name: '席料', price: 1000 },
  '回数券': { name: '回数券', price: 5000 },
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
      const { itemName } = await inquirer.prompt([
        {
          type: 'list',
          name: 'itemName',
          message: '商品を選択してください：',
          choices: Object.keys(items)
        }
      ]);

      let price = items[itemName].price;
      
      if (itemName === 'その他') {
        const { customPrice } = await inquirer.prompt([
          {
            type: 'number',
            name: 'customPrice',
            message: '金額を入力してください：',
            validate: (input: number) => input > 0 || '0より大きい数を入力してください'
          }
        ]);
        price = customPrice;
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