import crypto from 'crypto';

class Block {
    index: number;
    timestamp: number;
    data: any;
    previousHash: string;
    hash: string;
    nonce: number;

    // nonce is the number of times hash has been calculated to ensure that the hash starts with the required number of zeros
    // used as proof of work
    constructor(index: number, timestamp: number, data: any, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return crypto.createHash('sha256').update(
            this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.data) +
            this.nonce
        ).digest('hex');
    }

    // Difficulty is the number of leading zeros the hash should start with after encryption to increase computation time
    mineBlock(difficulty: number) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined: ' + this.hash);
    }
}

class BlockChain {
    chain: Block[];
    difficulty: number;

    constructor(difficulty = 2) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock: Block) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    } 
}

// Testing the blockchain
let coin = new BlockChain();
console.log('Mining block 1...');
coin.addBlock(new Block(1, Date.now(), { amount: 6 }));
console.log('Mining block 2...');
coin.addBlock(new Block(2, Date.now(), { amount: 12 }));
console.log('Mining block 3...');
coin.addBlock(new Block(3, Date.now(), { amount: 15 }));
console.log('Mining block 4...');
coin.addBlock(new Block(4, Date.now(), { amount: 2 }));

console.log(JSON.stringify(coin, null, 1));
console.log('Is blockchain valid? ' + coin.isChainValid());

// Tampering the blockchain
coin.chain[1].data = { amount: 100 };
console.log('Is blockchain valid? ' + coin.isChainValid());