import crypto from 'crypto';
import { Transaction } from './transaction';
import { CubeChain } from './cubechain';

export class Wallet {
    publicKey: string;
    privateKey: string;
    chain: CubeChain;

    constructor(chain: CubeChain) {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        this.publicKey = keypair.publicKey;
        this.privateKey = keypair.privateKey;
        this.chain = chain;
    }

    getBalance() {
        return this.chain.getBalanceOfAddress(this.publicKey);
    }

    sendMoney(amount: number, payeePublicKey: string) {
        const tx = new Transaction(this.publicKey, payeePublicKey, amount);
        tx.signTransaction(this.privateKey);
        this.chain.addTransaction(tx);
        return tx;
    }

    verifyTransaction(transaction: Transaction) {
        this.chain.verifyTransaction(transaction, this.publicKey);
    }
}