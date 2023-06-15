const mongoose = require("mongoose")
const { Schema } = mongoose

const ProductModel = new Schema(
    {
        productType: { type: String, required: true },
        color: [],
        size: [],
        price: { type: Number, required: true },
        productPhoto: { type: String, required: true },
        creator: { type: String },
    },
    { timestramp: true }
)

module.exports = mongoose.model("PRODUCT", ProductModel)

/**
 * productType
 * price
 * tshirtSize = []
 * designer
 * color = []
 * createdBy
 *
 */
