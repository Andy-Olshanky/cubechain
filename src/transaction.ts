import crypto from 'crypto';

export class Transaction {
    fromAddress: string | null;
    toAddress: string;
    amount: number;
    timestamp: number;
    signature: string | null;

    constructor(fromAddress: string | null, toAddress: string, amount: number) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
        this.signature = null;
    }

    calculateHash() {
        return crypto.createHash('sha256').update(
            this.fromAddress +
            this.toAddress +
            this.amount +
            this.timestamp
        ).digest('hex');
    }

    signTransaction(privateKey: string) {
        if (!this.fromAddress) {
            throw new Error('Cannot sign transactions for mining rewards');
        }

        const txHash = this.calculateHash();
        const sign = crypto.createSign('SHA256');
        sign.update(txHash);
        this.signature = sign.sign(privateKey, 'hex');
    }

    isValid() {
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const txHash = this.calculateHash();
        const verify = crypto.createVerify('SHA256');
        verify.update(txHash);
        return verify.verify(this.fromAddress, this.signature, 'hex');
    }
}