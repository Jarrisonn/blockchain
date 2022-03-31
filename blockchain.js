const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
class Block {
    constructor(timestamp, transactions, precedingHash=''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.precedingHash = precedingHash;
        this.nonce = 0;
        this.hash = this.computeHash();
    }
    computeHash(){
        return SHA256(this.precedingHash + this.timestamp + JSON.stringify(this.data)+this.nonce).toString();
    }
    proofOfWork(difficulty){
        while(this.hash.substring(0,difficulty) !==Array(difficulty + 1).join('0')){
            this.nonce++;
            this.hash = this.computeHash();
        }
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }

        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.blockchain = [this.startGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    startGenesisBlock(){
        return new Block(0, '04/10/2021', 'Initial Block in the Chain','0');
    }
    obtainLatestBlock(){
        return this.blockchain[this.blockchain.length - 1]
    }
   minePendingTransactions(miningRewardAddress){
       let block = new Block(Date.now(), this.pendingTransactions);
       block.proofOfWork(this.difficulty);

       console.log('Block mined');
       this.blockchain.push(block);

       this.pendingTransactions = [
           new Transaction(null, miningRewardAddress, this.miningReward)
       ]
   }
   addTransaction(transaction){
       if(!transaction.fromAddress || !transaction.toAddress){
           throw new Error('Transaction must include from and to address')
       }

       if(!transaction.isValid()){
           throw new Error("cannot add invalid transaction to chain")
       }
       this.pendingTransactions.push(transaction);
   }
   getBalanceOfAddress(address){
       let balance = 0;
       for(const block of this.blockchain){
           for(const trans of block.transactions){
               if(trans.fromAddress === address){
                   balance -= trans.amount
               }
               if(trans.toAddress === address){
                   balance += trans.amount
               }
           }
       }
       return balance;
   }

    checkChainValidity(){
        for (let index = 1; index < this.blockchain.length; index++) {
            const currentBlock = this.blockchain[index];
            const precedingBlock = this.blockchain[index - 1];


            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.computeHash()){
                return false;
            }
            
            if(currentBlock.precedingHash !== precedingBlock.hash){
                return false;
            }
            return true;
            
        }
    }
}



class Transaction{
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        
    }
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error("you cannot sign transactions for other wallets");
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx,"base64");
        this.signature = sig.toDER('hex');
    }
    isValid(){
       if(this.fromAddress === null) return true; 

       if(this.signature || this.signature.length === 0){
           throw new Error("No signature found in this transaction");
       }

       const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
       return publicKey.verify(this.calculateHash(), this.signature);
    }
    
}

module.exports.Blockchain = Blockchain
module.exports.Transaction = Transaction