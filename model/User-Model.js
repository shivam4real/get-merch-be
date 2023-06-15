const mongoose = require("mongoose")
const { Schema } = mongoose

const UserModel = new Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        mobile: { type: Number, required: true },
    },
    { timestramp: true }
)

module.exports = mongoose.model("USER", UserModel)
