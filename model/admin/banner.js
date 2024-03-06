const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: [{
        type: String,
        required: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
   
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
