const mongoose = require("mongoose")
const { Schema } = mongoose

const UserModel = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
    },
    { timestramp: true }
)

module.exports = mongoose.model("USER", UserModel)
