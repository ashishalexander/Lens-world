const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    date: { type: Date, default: Date.now }
});

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required:true
    },
    balance: { type: Number, default: 0 },
    transactions: [transactionSchema]
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
