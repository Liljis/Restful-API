const mongoose = require('mongoose');

const product_schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name : {type:String, required: [true, "name is required"]},
    price: {type:Number, required: true},
    productImage: {type:String, required:true}
})

module.exports = mongoose.model('Product', product_schema)