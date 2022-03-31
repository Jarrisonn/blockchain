const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('9c512de5ebe863885f033199cc7fcbe35f965fda31f707411206985130d0e99b');
const myWalletAddress = myKey.getPublic('hex');


const tx1 = new Transaction()
let joshCoin = new Blockchain();
console.log('mining in progress');
joshCoin.createTransaction(new Transaction('address 1', 'address 2', 100));
joshCoin.createTransaction(new Transaction('address 2', 'address 1', 50));

console.log('\n starting the miner')
joshCoin.minePendingTransactions('josh-address')
console.log('\n balance of josh is ', joshCoin.getBalanceOfAddress('josh-address'));

console.log('starting miner again');
joshCoin.minePendingTransactions('josh-address');

console.log('\n balance of josh is ', joshCoin.getBalanceOfAddress('josh-address'));