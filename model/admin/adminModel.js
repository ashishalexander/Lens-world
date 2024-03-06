const mongoose =require('mongoose')

const admin = new mongoose.Schema({
    name:{type:String, required:true},
    password:{type:String,required:true},
    role:{type:String,required:true}
})

const admincls = mongoose.model('admin',admin)
module.exports=admincls

