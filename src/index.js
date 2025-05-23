"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer = require("inquirer");
var items = {
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
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transaction, action, category, itemName, price, customPrice;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transaction = {
                        items: [],
                        total: 0
                    };
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 7];
                    return [4 /*yield*/, inquirer.prompt([
                            {
                                type: 'list',
                                name: 'action',
                                message: '操作を選択してください：',
                                choices: ['商品を追加', '合計を表示', '終了']
                            }
                        ])];
                case 2:
                    action = (_a.sent()).action;
                    if (action === '終了') {
                        return [3 /*break*/, 7];
                    }
                    if (!(action === '商品を追加')) return [3 /*break*/, 6];
                    return [4 /*yield*/, inquirer.prompt([
                            {
                                type: 'list',
                                name: 'category',
                                message: 'カテゴリを選択してください：',
                                choices: Object.keys(items)
                            }
                        ])];
                case 3:
                    category = (_a.sent()).category;
                    if (category === 'ドリンク' || category === '回数券') {
                        return [4 /*yield*/, inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'itemName',
                                    message: category === 'ドリンク' ? 'ドリンクを選択してください：' : '回数券の種類を選択してください：',
                                    choices: Object.keys(items[category])
                                }
                            ])];
                    }
                    else {
                        itemName = category;
                    }
                    _a.label = 4;
                case 4:
                    if (category === 'ドリンク' || category === '回数券') {
                        itemName = (_a.sent()).itemName;
                        price = items[category][itemName].price;
                    }
                    else if (itemName === '席料' || itemName === 'その他') {
                        return [4 /*yield*/, inquirer.prompt([
                                {
                                    type: 'number',
                                    name: 'customPrice',
                                    message: '金額を入力してください：',
                                    validate: function (input) { return input > 0 || '0より大きい数を入力してください'; }
                                }
                            ])];
                    }
                    else {
                        price = items[itemName].price;
                    }
                    _a.label = 5;
                case 5:
                    if (itemName === '席料' || itemName === 'その他') {
                        customPrice = (_a.sent()).customPrice;
                        price = customPrice;
                    }
                    transaction.items.push({ name: itemName, price: price });
                    transaction.total += price;
                    _a.label = 6;
                case 6:
                    if (action === '合計を表示') {
                        console.log('\n現在の取引内容：');
                        transaction.items.forEach(function (item) {
                            console.log("".concat(item.name, ": ").concat(item.price, "\u5186"));
                        });
                        console.log("\u5408\u8A08: ".concat(transaction.total, "\u5186\n"));
                    }
                    return [3 /*break*/, 1];
                case 7:
                    console.log('\n取引を終了します。');
                    console.log('最終合計:', transaction.total, '円');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
