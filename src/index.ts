import { CubeChain } from './cubechain';
import { Wallet } from './wallet';

// Testing the Cubechain
let coin = new CubeChain();

// Creating 10 test wallets
const wallet1 = new Wallet(coin);
const wallet2 = new Wallet(coin);
const wallet3 = new Wallet(coin);
const wallet4 = new Wallet(coin);
const wallet5 = new Wallet(coin);
const wallet6 = new Wallet(coin);
const wallet7 = new Wallet(coin);
const wallet8 = new Wallet(coin);
const wallet9 = new Wallet(coin);
const wallet10 = new Wallet(coin);

let allWallets = [
    {wallet: wallet1, name: 1}, 
    {wallet: wallet2, name: 2},
    {wallet: wallet3, name: 3},
    {wallet: wallet4, name: 4},
    {wallet: wallet5, name: 5},
    {wallet: wallet6, name: 6},
    {wallet: wallet7, name: 7},
    {wallet: wallet8, name: 8},
    {wallet: wallet9, name: 9},
    {wallet: wallet10, name: 10}
];
let miners = [
    {wallet: wallet1, name: 1},
    {wallet: wallet2, name: 2},
    {wallet: wallet9, name: 9},
    {wallet: wallet10, name: 10}
];
let verifiers = [
    {wallet: wallet3, name: 3},
    {wallet: wallet4, name: 4},
    {wallet: wallet5, name: 5},
    {wallet: wallet6, name: 6},
    {wallet: wallet7, name: 7},
    {wallet: wallet8, name: 8},
    {wallet: wallet9, name: 9},
    {wallet: wallet10, name: 10}
];

// Giving each wallet some money
allWallets.forEach(wallet => {
    coin.minePendingTransactions(wallet.wallet.publicKey, 1000);
});

// Get a random wallet
function getRandomWallet(walletList: any[]) {
    return walletList[Math.floor(Math.random() * walletList.length)];
}

// Get a random amount 5-500
function getRandomAmount(sender: Wallet) {
    const max = Math.min(500, sender.getBalance());
    return Math.floor(Math.random() * (max - 5 + 1) + 5);
}

const numTransactions = 50;
const start = performance.now();

for (let i = 0; i < numTransactions; i++) {
    try {
        if (Math.random() < 0.2) { // 20% chance of mining a new cube
            
            const miner = getRandomWallet(miners);
            console.log(`Mining a new block with Wallet ${miner.name}`);
            coin.minePendingTransactions(miner.wallet.publicKey, null, true);

        } else { // 80% chance of sending money
            
            const sender = getRandomWallet(allWallets);
            let recipient = getRandomWallet(allWallets);
            while (recipient === sender) {
                recipient = getRandomWallet(allWallets);
            }
            const amount = getRandomAmount(sender.wallet);
            const verifier = getRandomWallet(verifiers);

            console.log(`Sending money from Wallet ${sender.name} to Wallet ${recipient.name}, verified by Wallet ${verifier.name}`);

            const transaction = sender.wallet.sendMoney(amount, recipient.wallet.publicKey);
            verifier.wallet.verifyTransaction(transaction);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.log('Transaction failed: ' + e.message);
        } else {
            console.log('Transaction failed: ' + e);
        }
    }
}

const end = performance.now();
console.log(`\n${numTransactions} transactions took ${(end - start).toFixed(2)} milliseconds`);

// Print final balances
console.log('\nFinal Balances:');
allWallets.forEach((wallet) => {
    console.log(`Wallet ${wallet.name} balance: ${wallet.wallet.getBalance()}`);
});

// Verify the integrity of the blockchain
console.log(`\nIs blockchain valid? ${coin.isChainValid()}`);

// // Print the entire blockchain
// console.log('\nBlockchain:');
// console.log(JSON.stringify(coin, null, 2));