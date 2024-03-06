const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['flat', 'percentage'], required: true },
    discountAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
    minCartAmount: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});




module.exports = mongoose.model('Coupon', couponSchema);
