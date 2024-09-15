import { CubeChain } from './cubechain';
import { Wallet } from './wallet';

// Testing the Cubechain
let coin = new CubeChain();

const wallet1 = new Wallet(coin);
const wallet2 = new Wallet(coin);
const minerWallet = new Wallet(coin);
const verifierWallet = new Wallet(coin);

coin.minePendingTransactions(minerWallet.publicKey);
coin.minePendingTransactions(minerWallet.publicKey);
coin.minePendingTransactions(wallet1.publicKey);
coin.minePendingTransactions(wallet1.publicKey);
coin.minePendingTransactions(wallet2.publicKey);
coin.minePendingTransactions(wallet2.publicKey);

console.log('Balance of wallet1 is', wallet1.getBalance());
console.log('Balance of wallet2 is', wallet2.getBalance());
console.log('Balance of miner is', minerWallet.getBalance());
console.log('Balance of verifier is', verifierWallet.getBalance());

try {
    console.log('Attempting to send 50 coins from wallet1 to wallet2...');
    const transaction = wallet1.sendMoney(50, wallet2.publicKey);

    console.log('Verifying the transaction...');
    verifierWallet.verifyTransaction(transaction);

    console.log('Starting the miner...');
    coin.minePendingTransactions(minerWallet.publicKey);

    console.log('Balance of wallet1 is', wallet1.getBalance());
    console.log('Balance of wallet2 is', wallet2.getBalance());
    console.log('Balance of miner is', minerWallet.getBalance());
    console.log('Balance of verifier is', verifierWallet.getBalance());
} catch (e) {
    if (e instanceof Error) {
        console.log('Transaction failed: ' + e.message);
    } else {
        console.log('Transaction failed: ' + e);
    }
}

// // Mine one more block to include the mining reward transaction
// coin.minePendingTransactions(minerWallet.publicKey);

console.log('Final balance of wallet1 is', wallet1.getBalance());
console.log('Final balance of wallet2 is', wallet2.getBalance());
console.log('Final balance of miner is', minerWallet.getBalance());
console.log('Balance of verifier is', verifierWallet.getBalance());

// console.log(JSON.stringify(coin, null, 1));
// console.log('Is Cubechain valid? ' + coin.isChainValid());

// // Tampering the Cubechain
// coin.chain[1].hash = "{ amount: 100 }";
// console.log('Is Cubechain valid? ' + coin.isChainValid());