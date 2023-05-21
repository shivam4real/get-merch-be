const jwt = require("jsonwebtoken")

const secret = process.env.SECRET

const getToken = async (data) => {
    try {
        const token = await jwt.sign(data, secret)
        return token
    } catch (err) {
        console.log("Token Error " + err)
        return false
    }
}

const decodeToken = async (req, res, next) => {
    let token = req.header("Authorization")
    if (!token) {
        res.status(401).json({
            sucess: false,
            message: "Token Required.",
        })
    } else {
        try {
            const decode = await jwt.verify(token, secret)
            req.decode = decode.user
            next()
        } catch (err) {
            res.status(401).json({
                sucess: false,
                message: err,
            })
        }
    }
}

module.exports = { getToken, decodeToken }
