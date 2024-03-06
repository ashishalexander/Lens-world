// address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    fname : {type:String,required:true},
    lname : {type:String,required:true},
    addressLineOne : {type:String,required:true},   
    city: { type: String, required: true },
    state: { type: String, required: true },
    mobNo: {type:Number,required:true},
    pincode: { type: String, required: true, maxlength: 6, minlength: 6, pattern: /[0-9]*/ },
    gridRadios: { type: String, enum: ['Home', 'Work'], required: true },

    
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
