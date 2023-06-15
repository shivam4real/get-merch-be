const express = require("express")
const app = express()
const cors = require("cors")
const config = require("dotenv").config()
const mongoose = require("mongoose")

const users = require("./routes/users.js")
const product = require("./routes/product.js")

const port = process.env.PORT

const mongoURL = `mongodb+srv://${process.env.mongoDB_username}:${process.env.mongoDB_password}@${process.env.mongoDB}.5rnnpk0.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(mongoURL, (err) => {
    if (err) {
        console.log("Not able to connect " + err)
    } else {
        console.log("Connected to Database")
    }
})

// middleware
app.use(express.json())
app.use(cors())

// Routes
app.use("/user", users)
app.use("/product", product)

app.listen(port, (req, res) => {
    console.log(`Server started on ${port}`)
})
