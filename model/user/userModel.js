const address = require('../profile/addressModel')
const mongoose =require('mongoose')



const userSchema =new mongoose.Schema({
    fname : {type:String,required:true},
    lname : {type:String,required:true},
    email: { type: String, unique: true ,required:true},
    password:{type:String,required:true },
    mobNo:{type:Number},
    address:[{type:String}],
    status:{type:Boolean,default:true},
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    },
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
    ],

})

const user =mongoose.model('user',userSchema)
module.exports=user