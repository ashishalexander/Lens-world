const mongoose = require('mongoose')

const prtmgm = new mongoose.Schema({
  name: {type:String},
  description:{type:String},
  price:{type:Number},
  category:{type:String},
  brand:{type:String},
  quantity:{type:Number}, 
  imageUrl:[{type: String}],
  isdeleted:{type:Boolean,default:false},
  offer: { type: Number, default: 0 }
});

module.exports =mongoose.model("prtmgmcoll",prtmgm)