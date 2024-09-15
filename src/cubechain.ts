import { Cube } from './cube';
import { Transaction } from './transaction';

export class CubeChain {
    chain: Cube[];
    difficulty: number;
    pendingTransactions: Transaction[];
    miningReward: number;

    constructor(difficulty = 2, pendingTransactions = [], miningReward = 100) {
        this.chain = [this.createGenesisCube()];
        this.difficulty = difficulty;
        this.pendingTransactions = pendingTransactions;
        this.miningReward = miningReward;
    }

    createGenesisCube() {
        return new Cube(Date.now(), [], "0");
    }

    getLatestCube() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress: string) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);

        let cube = new Cube(Date.now(), [...this.pendingTransactions, rewardTx], this.getLatestCube().hash, miningRewardAddress);

        cube.mineCube(this.difficulty);

        console.log('Cube successfully mined!');
        this.chain.push(cube);

        this.pendingTransactions = [];
    }
    
    addTransaction(transaction: Transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0');
        }

        const totalAmount = transaction.amount + transaction.verifierReward;
        const balanceOfSender = this.getBalanceOfAddress(transaction.fromAddress);
        if (balanceOfSender < totalAmount) {
            throw new Error('Not enough balance in sender address');
        }

        this.pendingTransactions.push(transaction);
    }

    verifyTransaction(transaction: Transaction, verifierAddress: string) {
        if (this.pendingTransactions.includes(transaction)) {
            const verifierRewardTx = new Transaction(null, verifierAddress, transaction.verifierReward);
            this.pendingTransactions.push(verifierRewardTx);

            console.log(`Transaction verified by ${verifierAddress}`);
        } else {
            throw new Error('Transaction not found in pending transactions');
        }
    }

    getBalanceOfAddress(address: string) {
        let balance = 0;

        for (const cube of this.chain) {
            for (const tx of cube.transactions) {
                if (tx.fromAddress === address) {
                    balance -= tx.amount;
                    if (tx.fromAddress !== null) { // Not a reward transaction
                        balance -= tx.verifierReward;
                    }
                }

                if (tx.toAddress === address) {
                    balance += tx.amount;
                }
            }
        }

        return balance;
    }
        
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentCube = this.chain[i];
            const previousCube = this.chain[i - 1];

            if (!currentCube.hasValidTransactions()) {
                return false;
            }

            if (currentCube.hash !== currentCube.calculateHash()) {
                return false;
            }

            if (currentCube.previousHash !== previousCube.hash) {
                return false;
            }
        }

        return true;
    } 
}