import crypto from 'crypto';

class Transaction {
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

class Cube {
    timestamp: number;
    previousHash: string;
    transactions: Transaction[];
    hash: string;
    nonce: number;

    // nonce is the number of times hash has been calculated to ensure that the hash starts with the required number of zeros
    // used as proof of work
    constructor(timestamp: number, transactions: Transaction[], previousHash = '') {
        this.timestamp = timestamp;
        this.previousHash = previousHash;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
        
    }

    calculateHash() {
        return crypto.createHash('sha256').update(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).digest('hex');
    }

    // Difficulty is the number of leading zeros the hash should start with after encryption to increase computation time
    mineCube(difficulty: number) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Cube mined: ' + this.hash);
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

class CubeChain {
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
        const txReward = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(txReward);

        let cube = new Cube(Date.now(), this.pendingTransactions, this.getLatestCube().hash);
        cube.mineCube(this.difficulty);
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

        if (transaction.fromAddress !== null) {
            const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
            if (walletBalance < transaction.amount) {
                throw new Error('Not enough balance');
            }
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address: string) {
        let balance = 0;

        for (const cube of this.chain) {
            for (const tx of cube.transactions) {
                if (tx.fromAddress === address) {
                    balance -= tx.amount;
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

// Testing the Cubechain
let coin = new CubeChain();

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('Mining initial cube...');
coin.minePendingTransactions(publicKey);

console.log('Mining second cube...');
coin.minePendingTransactions(publicKey);

console.log('Balance of miner is', coin.getBalanceOfAddress(publicKey));

const tx1 = new Transaction(publicKey, 'address2', 50);
tx1.signTransaction(privateKey);
coin.addTransaction(tx1);

console.log('Starting the miner...');
coin.minePendingTransactions('minerAddress');

console.log('Balance of sender is', coin.getBalanceOfAddress(publicKey));
console.log('Balance of recipient is', coin.getBalanceOfAddress('address2'));
console.log('Balance of miner is', coin.getBalanceOfAddress('minerAddress'));

coin.minePendingTransactions('minerAddress');

console.log('Balance of sender is', coin.getBalanceOfAddress(publicKey));
console.log('Balance of recipient is', coin.getBalanceOfAddress('address2'));
console.log('Balance of miner is', coin.getBalanceOfAddress('minerAddress'));

// console.log(JSON.stringify(coin, null, 1));
// console.log('Is Cubechain valid? ' + coin.isChainValid());

// // Tampering the Cubechain
// coin.chain[1].hash = "{ amount: 100 }";
// console.log('Is Cubechain valid? ' + coin.isChainValid());