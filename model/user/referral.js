const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    referralCode: { type: String, unique: true, required: true },
    referees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Array to store multiple referees
    status: { type: String, enum: ['active', 'expired'], default: 'active' },
    reward: { type: Number, default: 0 },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 }, // Track how many times the referral code has been used
    expirationDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
   
});

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
