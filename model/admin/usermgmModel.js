const mongoose = require('mongoose');

const usermgmSchema = new Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    status:{tyepe:Boolean,default:false},
    address:[{
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true }
    }]
})
module.exports(mongoose.model('usermgmSchemaModel',usermgmSchema))