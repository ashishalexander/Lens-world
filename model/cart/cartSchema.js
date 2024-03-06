// cartSchema.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'prtmgmcoll', // Assuming you have a Product model
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    price: {
        type: Number,
        required: true, // Assuming each cart item has a price field
    },
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    items: [cartItemSchema],

    totalPrice: {
        type: Number,
        default: 0,
    },
    subtotal: {
        type: Number,
        default: 0, // Default to 0 if no discount applied
    },
});

const Cart = mongoose.model('Cart', cartSchema);



module.exports = { Cart, CartItem };
