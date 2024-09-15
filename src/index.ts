import { CubeChain } from './cubechain';
import { Wallet } from './wallet';

// Testing the Cubechain
let coin = new CubeChain();

const wallet1 = new Wallet(coin);
const wallet2 = new Wallet(coin);

console.log('Mining initial block...');
coin.minePendingTransactions(wallet1.publicKey);

console.log('Mining second block...');
coin.minePendingTransactions(wallet1.publicKey);

console.log('Wallet1 balance: ' + wallet1.getBalance());

try {
    console.log('Attempting to send 50 coins from wallet1 to wallet2...');
    wallet1.sendMoney(50, wallet2.publicKey);

    console.log('Mining pending transactions...');
    coin.minePendingTransactions(wallet1.publicKey);

    console.log('Wallet1 balance: ' + wallet1.getBalance());
    console.log('Wallet2 balance: ' + wallet2.getBalance());
} catch (e) {
    if (e instanceof Error) {
        console.log('Transaction failed: ' + e.message);
    } else {
        console.log('Transaction failed: ' + e);
    }
}

// Mine one more block to include the mining reward transaction
coin.minePendingTransactions(wallet1.publicKey);

console.log('Final balance of wallet1 is', wallet1.getBalance());
console.log('Final balance of wallet2 is', wallet2.getBalance());

// console.log(JSON.stringify(coin, null, 1));
// console.log('Is Cubechain valid? ' + coin.isChainValid());

// // Tampering the Cubechain
// coin.chain[1].hash = "{ amount: 100 }";
// console.log('Is Cubechain valid? ' + coin.isChainValid());