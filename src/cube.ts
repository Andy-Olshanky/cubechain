import crypto from 'crypto';
import { Transaction } from './transaction';

export class Cube {
    timestamp: number;
    previousHash: string;
    transactions: Transaction[];
    hash: string;
    nonce: number;
    miner: string;

    // nonce is the number of times hash has been calculated to ensure that the hash starts with the required number of zeros
    // used as proof of work
    constructor(timestamp: number, transactions: Transaction[], previousHash = '', miner = '') {
        this.timestamp = timestamp;
        this.previousHash = previousHash;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
        this.miner = miner;
    }

    calculateHash() {
        return crypto.createHash('sha256').update(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce +
            this.miner
        ).digest('hex');
    }

    // Difficulty is the number of leading zeros the hash should start with after encryption to increase computation time
    mineCube(difficulty: number) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        // console.log('Cube mined: ' + this.hash);
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}