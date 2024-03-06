const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'prtmgmcoll', // Assuming you have a Product model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isCanceled: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled','return-requested','returned','return-rejected'],
    default: 'confirmed', 
  },
  orderStatusHistory: [
    {
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled','return-requested','returned','return-rejected'],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  returnRequested: {
    type: Boolean,
    default: false, // Indicates whether return has been requested for this item
  },
  rtnApproved: {
    type: Boolean,
    default: false, // Indicates whether return has been approved for this item
  },
  rtnRejected:{
    type:Boolean,
    default:false
  },
  reason:{
    type:String,
    default:""
    
  }
});



const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Assuming you have a Customer model
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending','confirmed', 'processing', 'shipped', 'delivered','cancelled','returned'],
  },
  
  orderItems: [orderItemSchema],
  shippingAddress: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD','onlinepayment','wallet'],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  subtotal:{
    type: Number,
    default:0
  }
});

module.exports = mongoose.model('Order', orderSchema);
